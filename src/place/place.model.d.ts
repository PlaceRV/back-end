import { IUser } from 'user/user.model';
export interface IPlaceInfo {
    name: string;
    type: PlaceType;
    longitude: number;
    latitude: number;
    description: string;
}
export interface IPlace extends IPlaceInfo {
    createdBy?: IUser;
}
export declare enum PlaceType {
    CHURCH = "CHURCH",
    TEMPLE = "TEMPLE",
    NONE = "NONE"
}
