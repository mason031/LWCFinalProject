import { LightningElement } from 'lwc';
import SFILLOW_LOGO from '@salesforce/resourceUrl/SFillowLogo';
export default class Header extends LightningElement {

    logo = SFILLOW_LOGO;
    nav(e){
        console.log('something');
        let pageToNav = e.target.value;
        console.log("paget-to-nav"+pageToNav);
        this.dispatchEvent(new CustomEvent('changepageevent', {detail: pageToNav}));
    }
}