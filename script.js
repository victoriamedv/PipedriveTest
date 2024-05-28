// Event listener for form submission
document.querySelector('form').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Show loading spinner and apply blur effect
    document.getElementById('loading').style.display = 'block';
    document.getElementById('mainContainer').classList.add('blur');
    
    // Fetching data from the form
    var firstName = document.getElementById('firstName').value;
    var lastName = document.getElementById('lastName').value;
    var phone = document.getElementById('phone').value;
    var email = document.getElementById('email').value;
    var jobType = document.getElementById('jobType').value;
    var jobDescription = document.getElementById('jobDescription').value;
    var jobSource = document.getElementById('jobSource').value;
    var address = document.getElementById('address').value;
    var city = document.getElementById('city').value;
    var state = document.getElementById('state').value;
    var zipCode = document.getElementById('zipCode').value;
    var area = document.getElementById('area').value;
    var startDate = document.getElementById('startDate').value;
    var startTime = document.getElementById('startTime').value;
    var endTime = document.getElementById('endTime').value;
    var testSelect = document.getElementById('testSelect').value;
    var apiToken = document.getElementById('apiToken').value;
    var baseUrl = document.getElementById('baseUrl').value;

    // Checking that all fields are filled
    if (!firstName || !lastName || !phone || !email || !jobType || !jobDescription || !jobSource || !address || !city || !state || !zipCode || !area || !startDate || !startTime || !endTime || !testSelect || !apiToken || !baseUrl) {
        alert('Please fill in all fields.');
        // Hide loading spinner and remove blur effect
        document.getElementById('loading').style.display = 'none';
        document.getElementById('mainContainer').classList.remove('blur');
        return;
    }

    // Checking and creating fields
    var firstNameKey = await checkAndCreateField('First name', apiToken, baseUrl);
    var lastNameKey = await checkAndCreateField('Last name', apiToken, baseUrl);
    var phoneKey = await checkAndCreateField('Phone', apiToken, baseUrl);
    var emailKey = await checkAndCreateField('Email', apiToken, baseUrl);
    var jobTypeKey = await checkAndCreateField('Job Type', apiToken, baseUrl);
    var jobDescriptionKey = await checkAndCreateField('Job Description', apiToken, baseUrl);
    var jobSourceKey = await checkAndCreateField('Job Source', apiToken, baseUrl);
    var addressKey = await checkAndCreateField('Address', apiToken, baseUrl);
    var cityKey = await checkAndCreateField('City', apiToken, baseUrl);
    var stateKey = await checkAndCreateField('State', apiToken, baseUrl);
    var zipCodeKey = await checkAndCreateField('Zip Code', apiToken, baseUrl);
    var areaKey = await checkAndCreateField('Area', apiToken, baseUrl);
    var startDateKey = await checkAndCreateField('Start Date', apiToken, baseUrl);
    var startTimeKey = await checkAndCreateField('Start Time', apiToken, baseUrl);
    var endTimeKey = await checkAndCreateField('End Time', apiToken, baseUrl);
    var testSelectKey = await checkAndCreateField('Test Select', apiToken, baseUrl);

    // Searching for Person by first and last name
    try {
        const searchResponse = await axios.get(`${baseUrl}/v1/persons/search?api_token=${apiToken}&term=${firstName} ${lastName}&fields=name`);
        console.log(searchResponse);

        var personId;
        if (searchResponse.data.data && searchResponse.data.data.items && searchResponse.data.data.items.length > 0) {
            // If Person is found, use their ID
            personId = searchResponse.data.data.items[0].item.id;
        } else {
            // If Person is not found, create a new one
            const personResponse = await axios.post(`${baseUrl}/v1/persons?api_token=${apiToken}`, {
                name: firstName + ' ' + lastName,
                email: email,
                phone: phone
            });
            console.log(personResponse);
            personId = personResponse.data.data.id;
        }

        // Creating a Deal object
        var deal = {
            title: `Job type: ${jobType}, job source: ${jobSource}, job description: ${jobDescription}`,
            value: 0,
            currency: 'USD',
            person_id: personId,
            [firstNameKey]: firstName,
            [lastNameKey]: lastName,
            [phoneKey]: phone,
            [emailKey]: email,
            [jobTypeKey]: jobType,
            [jobDescriptionKey]: jobDescription,
            [jobSourceKey]: jobSource,
            [addressKey]: address,
            [cityKey]: city,
            [stateKey]: state,
            [zipCodeKey]: zipCode,
            [areaKey]: area,
            [startDateKey]: startDate,
            [startTimeKey]: startTime,
            [endTimeKey]: endTime,
            [testSelectKey]: testSelect
        };

        // Sending a POST request to the Pipedrive API to create a Deal
        const dealResponse = await axios.post(`${baseUrl}/v1/deals?api_token=${apiToken}`, deal);
        console.log(dealResponse);

        // Creating a Note object
        var noteContent = `first name - ${firstName}\nlast name - ${lastName}\nphone - ${phone}\nemail - ${email}\njob type - ${jobType}\njob description - ${jobDescription}\njob source - ${jobSource}\naddress - ${address}\ncity - ${city}\nstate - ${state}\nzip code - ${zipCode}\narea - ${area}\nstart date - ${startDate}\nstart time - ${startTime}\nend time - ${endTime}\ntest select - ${testSelect}`;

        var note = {
            content: noteContent,
            deal_id: dealResponse.data.data.id,
            pinned_to_deal_flag: true
        };

        // Sending a POST request to the Pipedrive API to create a Note
        const noteResponse = await axios.post(`${baseUrl}/v1/notes?api_token=${apiToken}`, note);
        console.log(noteResponse);
        
        // Hiding the main container and displaying the success message
        document.getElementById('mainContainer').style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';
        document.getElementById('dealLink').innerHTML = "<a href='" + baseUrl + "/deal/" + dealResponse.data.data.id + "' target='_blank'>View the deal</a>";
    } catch (error) {
        console.error(error);
        alert('An error occurred while creating a deal.');
    } finally {
        // Hide loading spinner and remove blur effect
        document.getElementById('loading').style.display = 'none';
        document.getElementById('mainContainer').classList.remove('blur');
    }
});

// Event listener for the "Back" button
document.getElementById('backButton').addEventListener('click', function() {
    location.reload();
});

// Function to check and create a field
async function checkAndCreateField(fieldName, apiToken, baseUrl) {
    const url = `${baseUrl}/v1/dealFields?api_token=${apiToken}`;

    try {
        // Fetching the list of all fields
        const response = await axios.get(url);
        const fields = response.data.data;

        // Checking if a field with the given name exists
        const existingField = fields.find(field => field.name === fieldName);

        // If the field exists, return its key
        if (existingField) {
            console.log(`Field ${fieldName} already exists.`);
            return existingField.key;
        } else {
            // If the field does not exist, create it
            const newField = {
                name: fieldName,
                field_type: 'text',
                add_visible_flag: true
            };

            const createResponse = await axios.post(url, newField);
            console.log(`Field ${fieldName} created with ID: ${createResponse.data.data.id}`);
            return createResponse.data.data.key; // Returning the 'key' key
        }
    } catch (error) {
        console.error(`Error: ${error}`);
    }
}
