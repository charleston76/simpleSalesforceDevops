public with sharing class AccountController {

    @AuraEnabled
    public static List<Account> getAccountList(List<String> accountIds){
        return AccountHelper.getAccountList(accountIds);
    }

}
