# invoice

nodejs == 6.x

# Creating Build For Invoice Application

Note:
if you are building applicatoin for live
First Goto app.module.js and comment 2 module 
Recurring & Statement 

After Commenting Run the following Commands In CMD

Commands:	
			1)gulp clean
			2)gulp build
	
after that you will have ( dist  ) folder in application directory

in dist --> Edit index.html And replace <base href="/"> with this <base href="/apps/invoice/">

also Upload ng-csv folder in ( /scripts ) folder and rename the folder location in index.html file
