public with sharing class PropertyHelper {
    public PropertyHelper() {

    }


    public static List<Double> geocode(String address){
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setMethod('GET');
        String key  = [SELECT Key__c FROM API_Key__mdt LIMIT 1].Key__c;
        System.debug(key);
        address = EncodingUtil.urlEncode(address, 'UTF-8');
        //System.debug(address);
        String url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key='+key;
        //url = EncodingUtil.urlEncode(url, 'UTF-8');
        request.setEndpoint(url);
        HttpResponse response = http.send(request);
        //System.debug(response.getBody());
        List<Double> latlng = new List<Double>();
        if(response.getStatusCode() == 200){

            Map<String,Object> responseBody = (Map<String,Object>)JSON.deserializeUntyped(response.getBody());
            //System.debug(responseBody);
            List<Object> results = (List<Object>)responseBody.get('results');
            Map<String,Object> result = (Map<String,Object>)results[0];
            Map<String,Object> geometry = (Map<String,Object>)result.get('geometry');
            Map<String,Object> location = (Map<String,Object>)geometry.get('location');
            Double latitude = (Double)location.get('lat');
            System.debug(latitude);
            latlng.add(latitude);
            Double longitude = (Double)location.get('lng');
            System.debug(longitude);
            latlng.add(longitude);
        }
        System.debug(address);
        System.debug(latlng);
        return latlng;      
    }


    @AuraEnabled
    public static List<Property__c> getPropertiesByDistance(String address){
        try {
            List<Double> latlng = geocode(address);
            Double latitude = latlng[0];
            Double longitude = latlng[1];
            System.debug(latitude);
            System.debug(longitude);
            List<Property__c> close_properties = new List<Property__c>();
            if(latitude != null && longitude != null){
                close_properties = [SELECT Id, Name FROM Property__c WHERE  DISTANCE(Property_Location__c, GEOLOCATION(:latitude,:longitude),'mi') < 50  ORDER BY 
                DISTANCE(Property_Location__c, GEOLOCATION(:latitude,:longitude), 'mi') LIMIT 5];
            }
            
            System.debug(close_properties);
            return close_properties;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled (cacheable=true)
    public static List<Property__c> getCloseProperties(String PropertyId){
        try {
            Property__c prop = [SELECT Property_Location__Longitude__s, Property_Location__Latitude__s FROM Property__c WHERE Id = :PropertyId];
            Double latitude = prop.Property_Location__Latitude__s;
            Double longitude = prop.Property_Location__Longitude__s;
            return [SELECT Id FROM Property__c WHERE DISTANCE(Property_Location__c, GEOLOCATION(:latitude,:longitude), 'mi') < 100 AND Id != :PropertyId LIMIT 3];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Property__c> getFeaturedProperties(){
        try {
            return [SELECT Id FROM Property__c LIMIT 2];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static Property__c getPropertyById(String propId){
        try {
            Property__c prop = [SELECT Id, Name, Address__c, Description__c, 
            Num_of_Baths__c, Num_of_Beds__c,Price__c,Property_Location__c,Property_Type__c,
            Square_Footage__c, Features__c FROM Property__c WHERE Id = :propId LIMIT 1];
            return prop;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true) 
    public static ContentVersion getThumbnailById(String propId){
        try {
            
            List<ContentDocumentLink> contentLinks = [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :propId];
            //String contentId = contentLink.Content
            List<String> contentIds = new List<String>();
            for(ContentDocumentLink c: contentLinks){
                contentIds.add(c.ContentDocumentId);
            }
            ContentDocument contentDoc = [SELECT Id FROM ContentDocument WHERE Id IN :contentIds AND Description = 'Thumbnail' LIMIT 1];
            ContentVersion contentVersion = [SELECT VersionDataUrl FROM ContentVersion WHERE ContentDocumentId = :contentDoc.Id LIMIT 1];
            System.debug(contentVersion);
            return contentVersion;
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<ContentVersion> getFilesById(String propId){
        try {

            List<ContentDocumentLink> contentLinks = [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :propId];
            List<String> contentIds = new List<String>();
            for(ContentDocumentLink c: contentLinks){
                contentIds.add(c.ContentDocumentId);
            }

            List<ContentVersion> contentVersions = [SELECT VersionDataUrl FROM ContentVersion WHERE ContentDocumentId IN :contentIds];
            System.debug(contentVersions);
            return contentVersions;
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void createFavorite(String propertyId, String userId){
        try {
            Property__c prop = [SELECT Id, Name FROM Property__c WHERE Id = :propertyId LIMIT 1];
            User user = [SELECT Id, Name FROM User WHERE Id = :userId LIMIT 1];
            String name = prop.Name + user.Name;
            Property_Favorite__c newfav = new Property_Favorite__c(Name = name, Property__c = prop.Id, User__c = user.Id);
            insert newfav;
            //System.debug([SELECT Id, Name, Property__c, User__c FROM Property_Favorite__c WHERE Id = :newfav.Id]);

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void deleteFavorite(String propertyId, String userId){
        try {
            Property_Favorite__c fav = [SELECT Id FROM Property_Favorite__c WHERE Property__c = :propertyId AND User__c = :userId LIMIT 1];
            System.debug(fav);
            delete fav;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled 
    public static Integer checkFavorite(String propertyId, String userId){
        try {
            Integer count = [SELECT COUNT() FROM Property_Favorite__c WHERE Property__c = :propertyId AND User__c = :userId];
            System.debug(count);
            return count;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled (cacheable=true)
    public static List<Property__c> getFavorites(String userId){
        try {
            List<Property_Favorite__c> favs = [SELECT Property__r.Id FROM Property_Favorite__c WHERE User__c = :userId];
            List<String> ids = new List<String>();
            for(Property_Favorite__c fav: favs){
                ids.add(fav.Property__c);
            }
            List<Property__c> props = [SELECT Id FROM Property__c WHERE Id IN :ids];
            System.debug(props);
            return props;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}

