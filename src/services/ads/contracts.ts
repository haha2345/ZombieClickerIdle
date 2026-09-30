import type { DemoAdId } from '../../content/demo'

export interface RewardedAdRequest {
  requestId: string
  placementId: DemoAdId
}

export type RewardedAdResult =
  | { status: 'completed'; requestId: string; receipt: string }
  | { status: 'cancelled' | 'unavailable' | 'failed'; requestId: string; reason?: string }

export interface RewardedAdProvider {
  show(request: RewardedAdRequest): Promise<RewardedAdResult>
}

// 真实广告平台尚未接入；游戏使用显式本地模拟，不能把接口返回或 UI 点击作为发奖凭证。
export class UnavailableAdProvider implements RewardedAdProvider {
  async show(request: RewardedAdRequest): Promise<RewardedAdResult> {
    return { status: 'unavailable', requestId: request.requestId, reason: '广告平台尚未接入' }
  }
}
