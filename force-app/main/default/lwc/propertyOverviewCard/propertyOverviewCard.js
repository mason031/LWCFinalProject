import getFilesById from '@salesforce/apex/PropertyHelper.getFilesById';
import getPropertyById from '@salesforce/apex/PropertyHelper.getPropertyById';
import getThumbnailById from '@salesforce/apex/PropertyHelper.getThumbnailById';
import { api, LightningElement, track, wire } from 'lwc';
import Propertydetailspage from 'c/propertydetailspage';
import checkFavorite from '@salesforce/apex/PropertyHelper.checkFavorite';
import createFavorite from '@salesforce/apex/PropertyHelper.createFavorite';
import deleteFavorite from '@salesforce/apex/PropertyHelper.deleteFavorite';
import Id from '@salesforce/user/Id';
import isguest from '@salesforce/user/isGuest';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import LightningAlert from 'lightning/alert';
import { refreshApex } from '@salesforce/apex';


export default class PropertyOverviewCard extends LightningElement {
    @api
    propertyid;

    constructor(){
        super();
        //this.propertyId = "a00RL00000FVkHFYA1";
        console.log(this.propertyid);
    }
    

    favoriteclicked=false;
    @api
    property;
    
    @track
    fileUrl;

    @track
    fileError;

    favorite;
    get favorite2(){
        if(this.favorite==0){
            return false;
        }
        else{
            return true;
        }
    }
    async checkFav(){
        console.log('checking fav');
        let isfav = await checkFavorite({propertyId: this.propertyid, userId: Id});
        console.log(isfav);
        isfav==0 ? this.favorite=false : this.favorite=true;
        console.log("favorite-bool" + this.favorite);
    }
    // @wire(checkFavorite,{propertyId: "$propertyid", userId: Id})
    // isfavorite(value){
    //     const {data,error} = value
    //     if(data){
    //         // data==0 ? this.favorite=false : this.favorite=true;
    //         this.favorite = value;
    //         console.log("favorite-bool"+this.favorite);
    //     }
    //     else{
    //         console.log(error);
    //     }
    // }

    @wire(getPropertyById,{propId: "$propertyid"})
    getProperty({data, error}){
        if(data){
            this.property = data;
            console.log(JSON.stringify(this.property));
            console.log(this.property.Price__c);
            console.log(this.property.Address__c);
        }
        else if(error){
            console.log(error);
        }
    }

    @wire(getThumbnailById, {propId: "$propertyid"})
    files({data,error}){
        if(data){
            this.fileUrl=data.VersionDataUrl;
            console.log(this.fileUrl);
            //console.log('urls' + JSON.stringify(this.fileUrls));
            //console.log(this.fileUrls.VersionDataUrl);
        }
        else if(error){
            this.fileError = error;
            console.log(this.fileError);
        }
    }

    async handlecardclick(e){
        if(this.favoriteclicked){
            e.stopPropagation();
            this.favoriteclicked=false;
        }
        
        else{
        console.log('click');
        const result = await Propertydetailspage.open({
            propertyid:this.propertyid,
            size:'medium'
        })
        console.log(result);
    }
    }

    async createFavorite(e){
        if(isguest){
            console.log('isguest'+ isguest);
            await LightningAlert.open({
                message: 'You must be logged in to add a favorite',
                variant: 'error',
                title: 'Not Logged In',
            });
        }
        else{
        console.log('creating favorite');
        console.log(Id);
        console.log(this.propertyid);
        this.favoriteclicked=true;
        try{
            await createFavorite({propertyId:this.propertyid, userId:Id});
            //this.favorite=true;
            await this.checkFav();
            console.log('after check'+this.favorite);
            this.dispatchEvent(new CustomEvent('update'));
            //await refreshApex(this.isfavorite);
            //this.checkFav();
        }catch(error){
            console.log(error);
        }
    }
    }

    async deleteFavorite(e){
        console.log('deleting favorite');
        this.favoriteclicked=true;
        if(isguest){
            console.log('isguest'+ isguest);
            await LightningAlert.open({
                message: 'You must be logged in to add a favorite',
                variant: 'error',
                title: 'Not Logged In',
            });
        }
        else{
        try{
            await deleteFavorite({propertyId:this.propertyid, userId:Id});
            //this.favorite=false;
            await this.checkFav();
            console.log('after check'+this.favorite);
            this.dispatchEvent(new CustomEvent('update'));
            //await refreshApex(this.isfavorite);
            //this.checkFav();
        }catch(error){
            console.log(error)
        }
    }
    }

    renderedCallback(){
        this.checkFav();
        //refreshApex(this.favorite);
        //this.checkFav();
        if(this.property){
            console.log("properpty" + this.property.Name);
        }
        
        console.log("refreshed favorite"+ this.favorite);
    }

    
    
}