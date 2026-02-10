export async function initMocks() {
  if (typeof window === "undefined") return;

  if (process.env.NODE_ENV === "development") {
    const { worker } = await import("./browser");

    await worker.start({
      onUnhandledRequest: "warn",
    });
  }
}