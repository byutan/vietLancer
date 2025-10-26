// Hàm tiện ích để kết hợp nhiều class name thành một chuỗi duy nhất.
// - Nhận vào nhiều đối số (string, array, object).
// - Bỏ qua giá trị falsy (null, undefined, false, '').
// - Nếu là object, chỉ lấy key có value truthy.
// Ví dụ:
//   cn('a', { b: true, c: false }, ['d', null]) => 'a b d'
export function cn(...inputs) {
  return inputs
    .flatMap(i => {
      if (!i) return [];
      if (typeof i === 'string') return [i];
      if (Array.isArray(i)) return i;
      if (typeof i === 'object') return Object.entries(i).filter(([_, v]) => v).map(([k]) => k);
      return [];
    })
    .join(' ');
}