import { LightningElement, track, wire } from 'lwc';
import {getListRecordsByName} from 'lightning/uiListsApi';
import PROPERTY_OBJECT from '@salesforce/schema/Property__c'
import { refreshApex } from '@salesforce/apex';
export default class Listingspage extends LightningElement {

    minprice = 0;
    maxprice = 10000000;


    @track
    sortby =[''];

    get sortbyvalue(){
        return [this.sortby];
    }

    get sortoptions(){
        return [
            {label: 'Price (High to Low)', value: '-Property__c.Price__c'},
            {label: 'Price (Low to High)', value: 'Property__c.Price__c'},
            {label: 'Bedrooms (High to Low)', value: '-Property__c.Num_of_Beds__c'},
            {label: 'Bedrooms (Low to High)', value: 'Property__c.Num_of_Beds__c'},
            {label: 'Bathrooms (High to Low)', value: '-Property__c.Num_of_Baths__c'},
            {label: 'Bathrooms (Low to High)', value: 'Property__c.Num_of_Baths__c'},
            {label: 'Square Footage (High to Low)', value: '-Property__c.Square_Footage__c' },
            {label: 'Square Footage (Low to High)', value: 'Property__c.Square_Footage__c'}
        ]
    }

    @track
    propertyTypes = ['House', 'Apartment','Condo', 'Townhome'];
    
    get propertyTypeOptions(){
        return [
            {label: 'House', value: 'House'},
            {label: 'Apartment', value: 'Apartment'},
            {label: 'Condo', value: 'Condo'},
            {label: 'Townhome', value: 'Townhome'}];

    }

    @track
    features=[];
    get featureOptions(){
        return [
            {label: 'Has Garage', value: 'Garage'},
            {label: 'Has Pool', value: 'Pool'},
            {label: 'Pet Friendly', value: 'PetFriendly'},
            {label: 'Has A/C', value: 'AC'}];

    }

    bedrooms = "1";
    get bedroomOptions(){
        return [
            {label: '1+', value: "1"},
            {label: '2+', value: "2"},
            {label: '3+', value: "3"},
            {label: '4+', value: "4"}];
    }

    bathrooms = "1";
    get bathroomOptions(){
        return [
            {label: '1+', value: "1"},
            {label: '2+', value: "2"},
            {label: '3+', value: "3"},
            {label: '4+', value: "4"}];
    }
    

    get filterquery(){
        let bedroomnum = parseInt(this.bedrooms);
        let bathroomnum = parseInt(this.bathrooms);

        let propertytypes=this.propertyTypes.join(',');
        propertytypes='['+propertytypes;
        propertytypes+=']';
        console.log("proprety types" + propertytypes);

        // let featurestring = this.features.join(',');
        // featurestring='[' + 'and,'+featurestring;

        // featurestring+=']';
        // console.log("features" + featurestring);
        let featurestring = '';
        for(let i = 0; i < this.features.length; i++){
            if(this.features[i]=="Pool"){
                featurestring += '{Features__c: {includes: [\'Pool\']}},';
            }
            else if(this.features[i]=="Garage"){
                featurestring += '{Features__c: {includes: [\'Garage\']}},';
            }
            else if(this.features[i]=="AC"){
                featurestring += '{Features__c: {includes: [\'AC\']}},';
            }
            else if(this.features[i]=="PetFriendly"){
                featurestring += '{Features__c: {includes: [\'PetFriendly\']}},';
            }
        }
            
        let query = '{and:[{Num_of_Beds__c: {gte: ' + bedroomnum + '}},{Num_of_Baths__c: {gte: ' + bathroomnum+'}},{Property_Type__c:{in:'+propertytypes+'}},{Price__c: {gte: ' + this.minprice +'}},{Price__c:{lte: '+this.maxprice +'}},'+featurestring+']}';
        
        return query;
    }

    @track
    propList;
    
    @track
    type = "House";

   
   bedroomnum = 0;
    @wire(getListRecordsByName, {
        objectApiName: PROPERTY_OBJECT.objectApiName,
        listViewApiName: 'All',
        fields: ["Property__c.Id", "Property__c.Name"],
        sortBy: "$sortbyvalue",
        where: "$filterquery"

    })properties(value){
        const {data,error} = value;
        console.log('value' + JSON.stringify(value));
        if(data){
            console.log('data');
            console.log(data);
            this.propList = value;
            console.log('this.propList' + JSON.stringify(this.propList));
            console.log('this.propList.data' + JSON.stringify(this.propList.data));
            console.log('this.propList.data.records' + JSON.stringify(this.propList.data.records));
        }
        else if(error){
            console.log('error');
            console.log(error);
        }
        else{
            console.log(PROPERTY_OBJECT);
            console.log('No data found');
        }
        
    }


    handlePropertyTypeChange(e){
        console.log(e.detail.value);
        this.propertyTypes = e.detail.value
        console.log("property in change" + this.propertyTypes);
        console.log("is e.detail.value an array "+Array.isArray(e.detail.value));
        console.log("is property types and array"+Array.isArray(this.propertyTypes));
        console.log("type of propertytype" + (typeof this.propertyTypes));
    }

    handleFeatureChange(e){
        this.features = e.detail.value;
    }

    handleBedroomChange(e){
        this.bedrooms =(e.detail.value);
    }

    handleBathroomChange(e){
        this.bathrooms = e.detail.value;
    }

    handleSectionToggle(e){
        console.log(e.detail.openSections);
       
        this.refs.sliderComponent?.reinitializeSlider();
        
    }

    handlePriceChange(e){

        console.log('details' + e.detail);
        this.minprice = e.detail.start;
        this.maxprice = e.detail.end;
        //console.log(typeof this.maxprice);
        console.log(e.detail.range);
    }

    handleSortChange(e){
        this.sortby = e.detail.value;
    }

    handleUpdate(e){
        console.log('listings refreshing');
        refreshApex(this.propList);
    }

    renderedCallback(){

    }
    connectedCallback(){
        
    }
    // get propList(){
    //     console.log('proplist');
    //     console.log(this.properties);
    //     console.log(this.properties.data);
    //     console.log(this.properties.data.records);
    //     return this.properties.data.records;
    // }
}