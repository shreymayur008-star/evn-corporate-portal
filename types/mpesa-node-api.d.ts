declare module 'mpesa-node-api' {
  function initializeApi(config: {
    baseUrl:             string
    apiKey:              string
    publicKey:           string
    origin:              string
    serviceProviderCode: string
  }): void
  function initiate_c2b(
    amount:         number,
    msisdn:         number,
    transactionRef: string,
    thirdPartyRef:  string
  ): Promise<Record<string, string>>
  function initiate_b2c(
    amount:         number,
    msisdn:         number,
    transactionRef: string,
    thirdPartyRef:  string
  ): Promise<Record<string, string>>
}
