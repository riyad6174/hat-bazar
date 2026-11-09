export function formatPhone(phone) {
  if (!phone) return '';
  if (phone.startsWith('+88')) return phone.slice(3);
  if (phone.startsWith('88') && phone.length > 11) return phone.slice(2);
  return phone;
}

export function parseItems(itemsStr) {
  try {
    const arr = JSON.parse(itemsStr || '[]');
    return arr.map((it) => (
      <div key={Math.random()} className="mb-1 last:mb-0">
        <span className="font-medium">{it.title || it.name || 'Item'}</span>
        <span className="text-gray-400 mx-1">×</span>
        <span className="text-blue-600 font-semibold">{it.quantity || 1}</span>
        {it.selectedColor && <span className="block text-[10px] text-gray-500">{it.selectedColor}</span>}
      </div>
    ));
  } catch {
    return <span className="text-gray-400 italic">No items</span>;
  }
}

export function parseItemQty(itemsStr) {
  try {
    const arr = JSON.parse(itemsStr || '[]');
    return arr.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0);
  } catch {
    return 0;
  }
}

export function CountBadge({ count }) {
  if (!count) return null;
  return (
    <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none inline-flex items-center justify-center shrink-0">
      {count > 99 ? '99+' : count}
    </span>
  );
}
