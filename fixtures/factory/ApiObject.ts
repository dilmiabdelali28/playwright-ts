import { AxiosFixtureService } from "$fixtures/services/axios/fixture.service";

import { BaseObject } from "./baseObject";

export class ApiObject extends BaseObject {
  private static fixtureService = new AxiosFixtureService();

  protected entity: string;

  protected appDomain: string;

  constructor(payload: any, entity: string, appDomain: string) {
    super(payload);
    this.entity = entity;
    this.appDomain = appDomain;
  }

  async create(accessToken: string, fixtureEnv: any): Promise<object> {
    return ApiObject.fixtureService.createFixtureByApi(
      accessToken,
      fixtureEnv,
      this.entity,
      this.payload,
      this.appDomain,
    );
  }

  async delete(accessToken: string, fixtureEnv: any): Promise<object> {
    return ApiObject.fixtureService.deleteFixtureByApi(
      accessToken,
      fixtureEnv,
      this.entity,
      this.payload.id,
      this.appDomain,
    );
  }
}
