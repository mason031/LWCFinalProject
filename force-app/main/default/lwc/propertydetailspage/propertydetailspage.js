import { api, LightningElement, track, wire } from 'lwc';
import LightningModal from 'lightning/modal';
import {getListRecordsByName} from 'lightning/uiListsApi';
import getPropertyById from '@salesforce/apex/PropertyHelper.getPropertyById';
import getFilesById from '@salesforce/apex/PropertyHelper.getFilesById';
import getCloseProperties from '@salesforce/apex/PropertyHelper.getCloseProperties';
import PROPERTY_OBJECT from '@salesforce/schema/Property__c';
import Webtolead from 'c/webtolead';
export default class Propertydetailspage extends LightningModal {

    @api
    propertyid;

    @track
    closeproperties;

    formattedaddress;

    @track
    property;

    @track
    fileUrls = [];

    @track
    features=[];

    @track
    mapMarkers=[{
        
    }]

    searchquery='';

    get query(){
        console.log("value in query" + this.searchquery);
        return '{Property_Location__c:{lt:{latitude: 37.329, longitude: -121.94, radius:100, unit:mi}}}';
       //return this.searchquery;
       //return '';
    }
    
    // @wire(getListRecordsByName, {
    //         objectApiName: PROPERTY_OBJECT.objectApiName,
    //         listViewApiName: 'All',
    //         fields: ["Property__c.Id"],
    //         where:{"Property_Location__c":{"lt":{"latitude": 37.329, "longitude": -121.94, "radius":50, "unit":"mi"}}}
            
    
    //     })properties({data, error}){
    //         if(data){
    //             console.log('data');
    //             console.log(data);
    //             this.closeproperties = data.records;
    //         }
    //         else{
    //             console.log('error' + JSON.stringify(error));
    //         }
    //     }
    
    @wire(getCloseProperties,{PropertyId: "$propertyid"})
    closeProperties({data, error}){
        if(data){
            this.closeproperties = data;
        }
        else{
            console.log('error' + JSON.stringify(error));
        }
    }

    @wire(getPropertyById,{propId: "$propertyid"})
        getProperty({data, error}){
            if(data){
                this.property = data;
                //console.log("property data" + JSON.stringify(this.property));
                //console.log(this.property.Features__c);
                const featurelist = this.property.Features__c.split(';');
                //console.log('lat/lng' + this.property.Property_Location__c.latitude + this.property.Property_Location__c.longitude);
                //console.log(JSON.stringify(this.property.Property_Location__c));
                this.mapMarkers=[{location:{
                    Latitude: this.property.Property_Location__c.latitude,
                    Longitude: this.property.Property_Location__c.longitude
                }}];
                const latitude = this.property.Property_Location__c.latitude;
                const longitude = this.property.Property_Location__c.longitude;
                const radius = 100;
                const unit = "MI";

                this.searchquery = `{Property_Location__c:{lt:{latitude: ${latitude}, longitude: ${longitude}, radius:${radius}, unit:${unit}}}}`;
                this.formattedaddress = this.property.Address__c.street + ', ' + this.property.Address__c.city + ', ' + this.property.Address__c.stateCode + ', ' + this.property.Address__c.postalCode;
                console.log(this.searchquery);
                //console.log("mapMarkers" + this.mapMarkers);
                featurelist.forEach(feature=>{
                    if(feature == "AC"){
                        this.features.push("Air Conditioning");
                    }
                    else if(feature == "Pool"){
                        this.features.push("Pool");
                    }
                    else if(feature == "PetFriendly"){
                        this.features.push("Pet Friendly");
                    }
                    else if(feature == "Garage"){
                        this.features.push("Garage");
                    }
                    //console.log(query);
                })
                // console.log(this.property.Price__c);
                //console.log(this.property.Address__c);
            }
            else if(error){
                console.log(error);
            }
        }

    @wire(getFilesById, {propId: "$propertyid"})
        files({data,error}){
            if(data){
                //this.fileUrl=data.VersionDataUrl;
                //console.log("data" + JSON.stringify(data));
                
                data.forEach(file => {
                    //console.log("file"+file);
                    this.fileUrls.push(file);
                });
                //console.log(this.fileUrls);

                //console.log('urls' + JSON.stringify(this.fileUrls));
                //console.log(this.fileUrls.VersionDataUrl);
            }
            else if(error){
                this.fileError = error;
                //console.log("error" + this.fileError);
            }
        }

        renderedCallback(){
            
                const style = document.createElement('style');
                style.innerText = `.slds-carousel__content {
                    display: none;
                }`;
                this.template.querySelector('lightning-carousel').appendChild(style);
            
        }
        async openModal(){
            const result = await Webtolead.open({
                size:'small',
                description:'Web-to-Lead form'
            });
        }
}