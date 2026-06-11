
<script>
  import { packages } from '../config/packages';
  import { services } from '../config/services';
  import Icon from '@iconify/svelte';
  import { onMount } from 'svelte';

  const referenceData = {
    packages: Object.fromEntries(packages.map((item) => [item.code, item.ar])),
    services: Object.fromEntries(services.map((item) => [item.id, item.ar])),
  };

  const statusLabels = { new: 'جديد', acknowledged: 'تم الاطلاع', completed: 'مكتمل', cancelled: 'ملغي' };
  const sourceLabels = { home: 'من المنزل', in_salon: 'داخل الصالون' };

  let orders = [];
  let loading = true;
  let filters = { status: '', source: '', todayOnly: false };
  let selectedOrder = null;
  let copied = false;
  let loadError = '';

  const formatDate = (value) =>
    new Intl.DateTimeFormat('ar-AE', { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(`${value}Z`)
    );

  const appointment = (order) =>
    order.order_source === 'home' ? `${order.arrival_date} · ${order.arrival_time}` : 'داخل الصالون الآن';

  const queueLabel = (order) =>
    order.queue_position
      ? `رقم الانتظار ${order.queue_position}`
      : order.order_source === 'home'
      ? 'موعد منزلي'
      : 'خارج الانتظار';

  const phoneDigits = (phone) => {
    const digits = String(phone || '').replace(/\D/g, '');
    return digits.startsWith('0') ? `971${digits.slice(1)}` : digits;
  };

  const orderText = (order) =>
    [
      `طلب #${order.id}`,
      `المصدر: ${sourceLabels[order.order_source]}`,
      order.queue_position ? `رقم الانتظار: ${order.queue_position}` : '',
      `العميل: ${order.customer_name}`,
      `الهاتف: ${order.phone || '—'}`,
      `العرض: ${referenceData.packages[order.package_code] || order.package_code}`,
      `الموعد: ${appointment(order)}`,
      `الحالة: ${statusLabels[order.status]}`,
      `الخدمات: ${order.selectedServiceIds.map((id) => referenceData.services[id] || id).join('، ')}`,
      `الملاحظات: ${order.notes || '—'}`,
    ].filter(Boolean).join('\n');

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
      setTimeout(() => { copied = false; }, 1500);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(`/api/control/orders/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('تعذر تحديث حالة الطلب');
      if (response.ok) {
        selectedOrder = null;
        await loadOrders();
      }
    } catch (e) {
      console.error('Failed to update status:', e);
      window.alert(e instanceof Error ? e.message : 'تعذر تحديث حالة الطلب');
    }
  };

  const exportCsv = () => {
    const quote = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const rows = [
      ['id', 'queue', 'source', 'customer', 'phone', 'package', 'appointment', 'status', 'services', 'notes'],
      ...orders.map((order) => [
        order.id,
        order.queue_position || '',
        order.order_source,
        order.customer_name,
        order.phone,
        referenceData.packages[order.package_code] || order.package_code,
        appointment(order),
        order.status,
        order.selectedServiceIds.map((id) => referenceData.services[id] || id).join(' | '),
        order.notes || '',
      ]),
    ];
    const blob = new Blob(['\uFEFF' + rows.map((row) => row.map(quote).join(',')).join('\n')], {
      type: 'text/csv;charset=utf-8',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ghaly-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const loadOrders = async () => {
    loading = true;
    loadError = '';
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.source) params.set('source', filters.source);
    if (filters.todayOnly) params.set('date', 'today');
    try {
      const response = await fetch(`/api/control/orders?${params}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      orders = result.orders;
    } catch (e) {
      console.error('Failed to load orders:', e);
      loadError = 'تعذر تحميل الطلبات';
    } finally {
      loading = false;
    }
  };

  onMount(() => {
    loadOrders();
    const refreshInterval = window.setInterval(loadOrders, 15000);
    return () => window.clearInterval(refreshInterval);
  });
</script>

<svelte:window on:keydown={(event) => {
  if (event.key === 'Escape') selectedOrder = null;
}} />

<header class="control-header">
  <div>
    <p>GHALY GENTS SALON</p>
    <h1>طلبات الصالون</h1>
    <span>تحديث تلقائي كل 15 ثانية</span>
  </div>
  <div class="header-actions">
    <button type="button" on:click={exportCsv}>
      <Icon icon="solar:file-download-bold" />
      تحميل CSV
    </button>
    <button type="button" on:click={loadOrders}>
      <Icon icon="solar:refresh-bold" />
      تحديث القائمة
    </button>
  </div>
</header>

<section class="control-filters" aria-label="فلاتر الطلبات">
  <label>
    <span>الحالة</span>
    <select bind:value={filters.status} on:change={loadOrders}>
      <option value="">جميع الحالات</option>
      <option value="new">جديد</option>
      <option value="acknowledged">تم الاطلاع</option>
      <option value="completed">مكتمل</option>
      <option value="cancelled">ملغي</option>
    </select>
  </label>
  <label>
    <span>المصدر</span>
    <select bind:value={filters.source} on:change={loadOrders}>
      <option value="">جميع الطلبات</option>
      <option value="in_salon">داخل الصالون</option>
      <option value="home">من المنزل</option>
    </select>
  </label>
  <label class="check-filter">
    <input type="checkbox" bind:checked={filters.todayOnly} on:change={loadOrders} />
    مواعيد اليوم
  </label>
  <p id="orders-state" role="status">
    {loading ? 'جاري تحميل الطلبات...' : loadError || (orders.length ? `${orders.length} طلب` : 'لا توجد طلبات')}
  </p>
</section>

<section class="orders-table-wrap">
  <table class="orders-table">
    <thead>
      <tr>
        <th>الترتيب</th>
        <th>الطلب</th>
        <th>العميل</th>
        <th>الهاتف</th>
        <th>العرض</th>
        <th>الموعد</th>
        <th>الحالة</th>
        <th>الإجراءات</th>
      </tr>
    </thead>
    <tbody>
      {#each orders as order (order.id)}
        <tr>
          <td class={order.queue_position ? 'queue-cell' : ''}>{queueLabel(order)}</td>
          <td>#{order.id}<br>{formatDate(order.created_at)}</td>
          <td>{order.customer_name}</td>
          <td>{order.phone || '—'}</td>
          <td>{referenceData.packages[order.package_code] || order.package_code}</td>
          <td>{appointment(order)}</td>
          <td>{statusLabels[order.status]}</td>
          <td class="row-actions">
            {#if order.phone}
              <a
                href={`tel:${order.phone}`}
                title="اتصال"
                aria-label="اتصال"
                class="icon-action"
              >
                <Icon icon="solar:phone-calling-bold" />
              </a>
              <a
                href={`https://wa.me/${phoneDigits(order.phone)}`}
                target="_blank"
                rel="noreferrer"
                title="واتساب"
                aria-label="واتساب"
                class="icon-action whatsapp-action"
              >
                <Icon icon="mdi:whatsapp" />
              </a>
            {/if}
            <button
              type="button"
              class="icon-action primary-action"
              title="المزيد من التفاصيل"
              aria-label="المزيد من التفاصيل"
              on:click={() => { selectedOrder = order; }}
            >
              <Icon icon="solar:menu-dots-bold" />
            </button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</section>

<section class="orders-cards">
  {#each orders as order (order.id)}
    <article class="order-card" data-status={order.status} on:click={() => { selectedOrder = order; }}>
      <div class="card-top">
        <div>
          <h2>{order.customer_name}</h2>
          <span>طلب #{order.id} · {sourceLabels[order.order_source]}</span>
        </div>
        <strong class="queue-badge">{queueLabel(order)}</strong>
      </div>
      <div class="card-meta">
        {#each [
          ['العرض', referenceData.packages[order.package_code] || order.package_code],
          ['الموعد', appointment(order)],
          ['الخدمات', `${order.selectedServiceIds.length} خدمات`],
          ['الحالة', statusLabels[order.status]],
        ] as [label, value]}
          <span>
            <small>{label}</small>
            <strong>{value}</strong>
          </span>
        {/each}
      </div>
      <div class="card-actions" on:click|stopPropagation>
        {#if order.phone}
          <a
            href={`tel:${order.phone}`}
            title="اتصال"
            aria-label="اتصال"
            class="icon-action"
          >
            <Icon icon="solar:phone-calling-bold" />
          </a>
          <a
            href={`https://wa.me/${phoneDigits(order.phone)}`}
            target="_blank"
            rel="noreferrer"
            title="واتساب"
            aria-label="واتساب"
            class="icon-action whatsapp-action"
          >
            <Icon icon="mdi:whatsapp" />
          </a>
        {/if}
        <button
          type="button"
          class="icon-action primary-action"
          title="المزيد من التفاصيل"
          aria-label="المزيد من التفاصيل"
          on:click={() => { selectedOrder = order; }}
        >
          <Icon icon="solar:menu-dots-bold" />
        </button>
      </div>
    </article>
  {/each}
</section>

{#if selectedOrder}
  <div
    class="control-dialog"
    role="dialog"
    aria-modal="true"
    aria-label={`طلب #${selectedOrder.id}`}
    on:click={() => { selectedOrder = null; }}
  >
    <div class="control-dialog-inner" on:click|stopPropagation>
      <header>
        <div>
          <small>GHALY GENTS SALON</small>
          <h2>طلب #{selectedOrder.id} · {queueLabel(selectedOrder)}</h2>
        </div>
        <button type="button" aria-label="إغلاق" on:click={() => { selectedOrder = null; }}>×</button>
      </header>
      <div class="detail-actions">
        {#if selectedOrder.phone}
          <a
            href={`tel:${selectedOrder.phone}`}
            title="اتصال"
            aria-label="اتصال"
            class="icon-action"
          >
            <Icon icon="solar:phone-calling-bold" />
          </a>
          <a
            href={`https://wa.me/${phoneDigits(selectedOrder.phone)}`}
            target="_blank"
            rel="noreferrer"
            title="واتساب"
            aria-label="واتساب"
            class="icon-action whatsapp-action"
          >
            <Icon icon="mdi:whatsapp" />
          </a>
          <button
            type="button"
            class="icon-action"
            title="نسخ الرقم"
            aria-label="نسخ الرقم"
            on:click={() => copyText(selectedOrder.phone)}
          >
            <Icon icon="solar:copy-bold" />
          </button>
        {/if}
        <button
          type="button"
          class="icon-action"
          title="نسخ الطلب"
          aria-label="نسخ الطلب"
          on:click={() => copyText(orderText(selectedOrder))}
        >
          <Icon icon="solar:clipboard-text-bold" />
        </button>
      </div>
      <div class="details-content">
        {#each [
          ['المصدر', sourceLabels[selectedOrder.order_source]],
          ['العميل', selectedOrder.customer_name],
          ['الهاتف', selectedOrder.phone || '—'],
          ['العرض', referenceData.packages[selectedOrder.package_code] || selectedOrder.package_code],
          ['الموعد', appointment(selectedOrder)],
          ['تفضيل الموظف', selectedOrder.staff_preference || '—'],
          ['الملاحظات', selectedOrder.notes || '—'],
          ['وقت الطلب', formatDate(selectedOrder.created_at)],
        ] as [label, value]}
          <p>
            <strong>{label}</strong>
            <span>{value}</span>
          </p>
        {/each}
        <h3>الخدمات المختارة</h3>
        <ul>
          {#each selectedOrder.selectedServiceIds as id}
            <li>{referenceData.services[id] || id}</li>
          {/each}
        </ul>
      </div>
      <footer id="status-actions">
        {#each Object.entries(statusLabels) as [status, label]}
          <button
            type="button"
            disabled={status === selectedOrder.status}
            on:click={() => updateStatus(selectedOrder.id, status)}
          >
            {label}
          </button>
        {/each}
      </footer>
    </div>
  </div>
{/if}

{#if copied}
  <div class="copy-toast" role="status">تم النسخ</div>
{/if}
