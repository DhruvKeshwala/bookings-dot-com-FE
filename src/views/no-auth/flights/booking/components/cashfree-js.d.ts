declare module '@cashfreepayments/cashfree-js' {
    export interface Cashfree {
      createOrder: (...args: any[]) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
    }
  
    export function load(options: {
      mode: 'sandbox';
    }): Promise<Cashfree>;
  }