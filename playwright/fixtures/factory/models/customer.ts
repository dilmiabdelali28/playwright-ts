import { BaseObject } from "../baseObject";
import { bobMsCustomerPayload } from "./customersPayloads/bobMsCustomerPayload";
import { promoterMsCustomerPayload } from "./customersPayloads/promoterMsCustomerPayload";

export class Customer extends BaseObject {
  static bob = () => new Customer(bobMsCustomerPayload).withNewId();

  static mary = () =>
    new Customer(bobMsCustomerPayload).withNewId().with({
      firstName: "Mary",
      fullname: "Mary Playwright",
    });

  static harmony = () =>
    new Customer(bobMsCustomerPayload).withNewId().with({
      firstName: "Harmony",
      fullname: "Cobel",
    });

  static promoter = () =>
    new Customer(promoterMsCustomerPayload)
      .withNewId()
      .with({
        firstName: "Promoteur",
        fullname: "Promoteur Playwright",
      })
      .withCurrentCreatedAtAndUpdatedAtDates();

  withLogin(login: string) {
    return this.with({
      authentification: {
        status: "ACTIVE",
        temporaryLogin: null,
        isFirstConnection: false,
        fistConnectionValidationToken: null,
        cryptLoginV3: null,
        resetPasswordToken: null,
        resetPasswordTokenV3: null,
        password:
          "$2a$04$IZB.IOOskO4X32jE7mzLb.yyrgPt6HUnV/dCIuQoA2pzpKvcVC8DG",
        login,
      },
    });
  }
}
