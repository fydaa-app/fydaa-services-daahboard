
export interface PortfolioData {
    portfolioName:string,
    planId:string,
    termId:string,
    stockIds:string,
    weights:string
}

export interface PortfolioRequestData {
    id: string,
}

// class PortfolioManagementServiceApi extends API {

//     async addPortfolio(data: PortfolioData): Promise<APIResponse> {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
//         return this.post(ApiType.private, `${this.baseUrl}/portfolio`, data)
//     }

// }

// export const portfolioManagementServiceApi = new PortfolioManagementServiceApi();