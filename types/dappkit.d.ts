export type NetworkParameters = "councilAmount" | 
  "disputableTime" | 
  "draftTime" | 
  "oracleExchangeRate" | 
  "mergeCreatorFeeShare" | 
  "proposerFeeShare" |
  "percentageNeededForDispute" |
  "cancelFee" |
  "closeFee" |
  "cancelableTime" |
  "treasury";

export type Entities = "bounty" | "proposal" | "pull-request" | "registry" | "oracles";

export type Events = "created" | 
  "canceled" | 
  "closed" | 
  "disputed" | 
  "ready" | 
  "updated" | 
  "refused" | 
  "funded" | 
  "changed" |
  "registered";