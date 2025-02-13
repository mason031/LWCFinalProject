import getFeaturedProperties from '@salesforce/apex/PropertyHelper.getFeaturedProperties';
import { LightningElement, track, wire } from 'lwc';
import getPropertiesByDistance from '@salesforce/apex/PropertyHelper.getPropertiesByDistance';
import {refreshApex } from '@salesforce/apex';

export default class Homepage extends LightningElement {

    @track
    featuredProperties;

    @track
    distanceProperties;

    @wire(getFeaturedProperties)
    getFeaturedProps({data, error}){
        if(data){
            this.featuredProperties = data;
            //this.featuredProperties = data;
            //console.log(this.featuredProperties);
            this.featuredProperties = this.featuredProperties.map((property,index)=>({
                ...property, visible:false,tabIndex:"-1",hidden:"true",panelId:"panel"+index,indicatorId:"indicator"+index

            }))
            // this.featuredProperties.forEach((property)=>{
            //     property.visible = "false";
            // });
            this.featuredProperties[0].visible=true;
            this.featuredProperties[0].tabIndex="0";
            this.featuredProperties[0].hidden="false";
            console.log(JSON.stringify(this.featuredProperties));
        }
        else if (error){
            console.log(error);
        }
    }

    handleClick(e){
        console.log(e.target.dataset.value);
        let i = e.target.dataset.value;
        this.featuredProperties = this.featuredProperties.map((property, index) => ({

            ...property,
            visible: i == index ? true : false,
            tabIndex: i == index ? "0" : "-1",
            hidden: i == index ? "false" : "true"
        }))
        
        console.log('new featured props' + JSON.stringify(this.featuredProperties));

    }

    handleSearch(){
        //let address = this.template.querySelector('input').value;
        let searchAddress = this.refs.search.value;
        console.log(searchAddress);
        getPropertiesByDistance({address:searchAddress}).then((res)=>{
            this.distanceProperties = res;
            console.log(JSON.stringify(this.distanceProperties));
            refreshApex(this.distanceProperties);
        }).catch((e)=>{
            console.log(e);
        })
        
    }

    

    

}