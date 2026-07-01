import { BaseObject } from "../baseObject";

export class File extends BaseObject {
  static trusteeContract = (
    trusteeContractPropositionId: string,
    missionTrusteeContractId: string,
  ) => {
    const payload = {
      filename: "random.pdf",
      description: "",
      isHiddenOnMyFoncia: true,
      mimeType: "application/pdf",
      category: "trusteeContractProposition",
      metadata: {
        trusteeContractPropositionId,
        missionTrusteeContractId,
      },
      filters: [
        {
          k: "trusteeContractPropositionId",
          v: trusteeContractPropositionId,
        },
        {
          k: "missionTrusteeContractId",
          v: missionTrusteeContractId,
        },
      ],
    };

    return new File(payload).withNewId();
  };
}
