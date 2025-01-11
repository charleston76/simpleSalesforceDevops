public with sharing class AccountHelper {
    private static string CLASS_NAME = 'AccountHelper ';

    private static AccountHelper instance = new AccountHelper();

    //private constructor to avoid creating an instance
    private AccountHelper(){}

    public static AccountHelper getInstance(){
        return instance;
    }

    public List<Account> getAccountList(List<String> accountIds){
        String METHOD_NAME = 'getAccountList';
        List<Account> lstReturn = new List<Account>();
        
        try {
            lstReturn  = [
                SELECT Id, Name, CreatedDate , ContactNewCustomer__c FROM Account WHERE Id IN: accountIds
            ];
        } catch (Exception objEx) { System.debug(CLASS_NAME + ' ' + METHOD_NAME + ' Error Line Number: ' + objEx.getLineNumber() + ' Message: ' + objEx.getMessage()); }
        //     // Here is just a simple example how to log the things when errors happen, but believe me, it helps a lot
        //     System.debug(CLASS_NAME + ' ' + METHOD_NAME + ' Error Line Number: ' + objEx.getLineNumber() + ' Message ' + objEx.getMessage());
        //     throw objEx;
        // } 

        return lstReturn;
    }
}
