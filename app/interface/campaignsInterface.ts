import { campaign_transactionsInterface } from "./campaign_transactionsInterface";

export interface campaignsInterface {
  id: number;
  name: string;
  details: string;
  price: number;
  stock: number;
  formDetails: string;
  formWish: boolean;
  campaign_img: string;
  status: string;
  postId: string;
  topicId: number;
  createdAt: Date;
  updatedAt: Date;
  campaign_transactions: campaign_transactionsInterface[];
}
