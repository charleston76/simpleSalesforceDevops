public with sharing class AccountHelper {
    private static string CLASS_NAME = 'AccountHelper ';

    public static List<Account> getAccountList(List<String> accountIds){
        String METHOD_NAME = 'getAccountList';
        List<Account> lstReturn = new List<Account>();
        
        try {
            lstReturn  = [
                SELECT Id, Name FROM Account WHERE Id IN: accountIds
            ];
            
        } catch (Exception objEx) {
            // Here is just a simple example how to log the things when errors happen, but believe me, it helps a lot
            System.debug(CLASS_NAME + ' ' + METHOD_NAME + ' Error Line Number: ' + objEx.getLineNumber() + ' Message ' + objEx.getMessage());
            throw objEx;
        } 

        return lstReturn;
    }
}
