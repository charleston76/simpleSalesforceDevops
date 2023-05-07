@isTest
public class AccountHelperTest {
    @testSetup static void setup() {
        // Create the accout to get
        Account newAcc = new Account (
            Name = 'Test' + System.now().getTime()
        );

        insert newAcc;

    }
    @isTest static void getAccountListTest() {
        List<String> accountIds = new List<String>{
            String.valueOf([SELECT Id FROM Account LIMIT 1].Id)
        };

        Test.startTest();
        List<Account> lstAccount = AccountHelper.getAccountList(accountIds );
        Test.stopTest();
        
        System.assertNotEquals(lstAccount.size(),0);
    }
}