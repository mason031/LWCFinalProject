import { LightningElement, track, wire } from 'lwc';
import Id from '@salesforce/user/Id';
import { getRecord } from 'lightning/uiRecordApi';
import PHOTO_URL_FIELD from '@salesforce/schema/User.MediumPhotoUrl';
import NAME_FIELD from '@salesforce/schema/User.Name';
import EMAIL_FIELD from '@salesforce/schema/User.Email';
import PHONE_FIELD from '@salesforce/schema/User.Phone';
import getFavorites from '@salesforce/apex/PropertyHelper.getFavorites';
import { refreshApex } from '@salesforce/apex';
export default class Accountpage extends LightningElement {

    @track
    user;

    @track
    fields=[NAME_FIELD];

    recordid=Id;

    photourl;
    @wire(getRecord,{recordId: Id, fields:[NAME_FIELD], optionalFields:[PHOTO_URL_FIELD, EMAIL_FIELD, PHONE_FIELD]})
    userRecord({data,error}){
        console.log(Id);
        if(data){
            this.user = data;
            this.photourl = this.user.fields.MediumPhotoUrl.value;
            console.log("data"+JSON.stringify(this.user));
            console.log("medium photo url" + this.user.fields.MediumPhotoUrl.value);
            console.log(this.photourl);
            if(this.user.fields.Phone){
                this.fields.push(PHONE_FIELD);
            }
            if(this.user.fields.Email){
                this.fields.push(EMAIL_FIELD);
            }

        }
        else{
            console.log("error"+error);
        }
    }

    @track
    favList;
    @wire(getFavorites, {userId:Id})
    favorites(value){
        const {data,error} = value;
        if(data){
            console.log("favorites"+JSON.stringify(data));
            this.favList = value;
        }
        else{
            console.log(error);
        }
    }

    handleUpdate(e){
        refreshApex(this.favList);
        console.log("refreshing apex" + JSON.stringify(this.favList));
    }

    renderedCallback(){
        refreshApex(this.favList);
        console.log("refreshing apex" + JSON.stringify(this.favList));
    }

}