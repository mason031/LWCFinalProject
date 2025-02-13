import { LightningElement } from 'lwc';

export default class Main extends LightningElement {

    renderHome = true;
    renderListings = false;
    renderAccount = false;
    changePage(e){
        console.log('label' + e.detail);
        switch(e.detail){
            case 'Home':
                this.renderHome = true;
                this.renderListings = false;
                this.renderAccount = false;
                break;
            case 'All Listings':
                this.renderHome = false;
                this.renderListings = true;
                this.renderAccount = false;
                break;
            case 'Account':
                this.renderHome = false;
                this.renderListings = false;
                this.renderAccount = true;
                break;
        }

        
    }


}