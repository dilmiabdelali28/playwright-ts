import axios from "axios";

import type { ApiObject } from "$fixtures/factory/ApiObject";

function withApiBaseURL(
  fixtureEnv: Record<string, { API_BASE_URL?: string }>,
  appDomain: string,
  path: string,
): string {
  const apiBaseUrl = fixtureEnv[appDomain]?.API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error(
      `appDomain is not defined in the apiRequest for path ${path}`,
    );
  }

  return apiBaseUrl + path;
}

/**
 * Playwright port of cypress/support/services/axios/fixture.service.ts
 * Used by fixtures/factory/ApiObject.ts
 */
export class AxiosFixtureService {
  async createFixtureByApi(
    accessToken: string,
    fixtureEnv: Record<string, { API_BASE_URL?: string }>,
    entity: string,
    body: object,
    appDomain: string,
  ): Promise<object> {
    const response = await axios.post(
      withApiBaseURL(fixtureEnv, appDomain, `/${entity}`),
      body,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return response.data;
  }

  async deleteFixtureByApi(
    accessToken: string,
    fixtureEnv: Record<string, { API_BASE_URL?: string }>,
    entity: string,
    id: string,
    appDomain: string,
  ): Promise<object> {
    const response = await axios.delete(
      withApiBaseURL(fixtureEnv, appDomain, `/${entity}/${id}`),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return response.data;
  }

  async createFixture(
    accessToken: string,
    fixtureEnv: Record<string, { API_BASE_URL?: string }>,
    data: Record<string, unknown>,
    appDomain = "ADB",
  ): Promise<Record<string, unknown>> {
    const response = await axios.post(
      withApiBaseURL(fixtureEnv, appDomain, "/fixture"),
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return response.data;
  }

  deleteRealEstateFixture(
    _accessToken: string,
    _fixtureEnv: Record<string, { API_BASE_URL?: string }>,
    contextRealEstate?: ApiObject[],
  ): void {
    if (Array.isArray(contextRealEstate) && contextRealEstate.length > 0) {
      contextRealEstate.reverse();
    }
  }
}
