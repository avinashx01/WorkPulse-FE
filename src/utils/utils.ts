export interface PaginationParams {
  page: number
  limit: number
  sortBy: string
  sortByDirection: 'ASC' | 'DESC'
  search: string
  totalPages: number
}

export interface PaginationParamsWithUser extends PaginationParams {
  organizationId?: string
  userId?: string
}

export interface PaginationParamsWithOverDueAndUser extends PaginationParamsWithUser {
  overDueNo: string
}

export function preparePaginationParams(params: PaginationParamsWithUser) {
  const paramsObj: any = {}

  if (params.page) {
    paramsObj.page = params.page + 1
  }

  if (params.limit) {
    paramsObj.limit = params.limit
  }

  if (params.sortBy) {
    paramsObj.sortBy = `${params.sortBy}:${params.sortByDirection}`
  }

  if (params.search) {
    paramsObj.search = params.search
  }

  paramsObj.organizationId = params.organizationId
  paramsObj.userId =params.userId

  return paramsObj
}
