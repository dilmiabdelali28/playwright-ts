import type { BoApiContext } from "../bo-api-context";

export class BoFixtureApiClient {
  constructor(private readonly ctx: BoApiContext) {}

  async createFixture<T>(payload: Record<string, unknown>): Promise<T | null> {
    if (!this.ctx.accessToken) {
      return null;
    }

    const url = `${this.ctx.boApiBaseUrl}/fixture`;
    const response = await this.ctx.request.post(url, {
      headers: { authorization: `Bearer ${this.ctx.accessToken}` },
      data: payload,
    });
    if (!response.ok()) {
      const body = await response.text().catch(() => "(unreadable)");
      console.warn(
        `[BoFixtureApiClient] POST ${url} failed — status=${response.status()} body=${body.slice(0, 300)}`,
      );
      return null;
    }

    return (await response.json()) as T;
  }
}
