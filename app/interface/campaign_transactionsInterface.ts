import { campaignsInterface } from "./campaignsInterface";
import { customersInterface } from "./customersInterface";
import { transactiondetailsInterface } from "./transactiondetailsInterface";

export interface campaign_transactionsInterface {
  id: number;
  campaignId: number;
  value: number;
  slip_img: string;
  img_url: string;
  qrimg_url: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  campaign: campaignsInterface;
  transactiondetails: transactiondetailsInterface[];
  customer: customersInterface;
  transactionID: string;
  many_names: string;
  name: string;
}
