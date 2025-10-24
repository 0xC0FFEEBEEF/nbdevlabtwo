if (typeof globalThis.MessageChannel === "undefined") {
  const scheduleMicrotask =
    typeof queueMicrotask === "function"
      ? queueMicrotask
      : (cb: () => void) => Promise.resolve().then(cb).catch(() => setTimeout(cb, 0));

  class MessagePortPolyfill {
    onmessage: ((event: { data: unknown }) => void) | null = null;
    private partner: MessagePortPolyfill | null = null;

    postMessage(value: unknown) {
      if (!this.partner) return;
      const target = this.partner;
      scheduleMicrotask(() => {
        const handler = target.onmessage;
        if (typeof handler === "function") {
          handler({ data: value });
        }
      });
    }

    start() {}

    close() {
      this.partner = null;
      this.onmessage = null;
    }

    _setPartner(port: MessagePortPolyfill) {
      this.partner = port;
    }
  }

  class MessageChannelPolyfill implements MessageChannel {
    port1: MessagePort;
    port2: MessagePort;

    constructor() {
      const port1 = new MessagePortPolyfill();
      const port2 = new MessagePortPolyfill();
      port1._setPartner(port2);
      port2._setPartner(port1);
      this.port1 = port1 as unknown as MessagePort;
      this.port2 = port2 as unknown as MessagePort;
    }
  }

  // @ts-expect-error Assigning runtime polyfill for Cloudflare Workers
  globalThis.MessageChannel = MessageChannelPolyfill;
}
