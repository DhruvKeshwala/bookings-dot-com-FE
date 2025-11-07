// export const debounce = <F extends (...args: unknown[]) => unknown>(
//   func: F,
//   delay: number
// ) => {
//   let timer: NodeJS.Timeout;
//   return (...args: Parameters<F>) => {
//     clearTimeout(timer);
//     timer = setTimeout(() => {
//       func(...args);
//     }, delay);
//   };
// };

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return function(this: any, ...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  } as T;
}
