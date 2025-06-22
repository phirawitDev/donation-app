import { campaignsInterface } from "./campaignsInterface";

export interface topicInterface {
  id: number;
  name: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  campaign: campaignsInterface[];
}
