
let currentPatientId = null;
const url = "http://localhost:8000";

const getStatus = async () => {
  const res = await fetch(`${url}/policies/statusofpolicies`);
  const data = await res.json();

  const activatedPolicies =document.querySelector("#activatedPolicies");
  activatedPolicies.innerHTML = '';
  activatedPolicies.innerHTML = `
  <div class="metric-label">Active Policies</div>
        <div class="metric-number">${data.result.activeCount}<span style="color:brown;font-size:14px;margin-left:6px;">▲</span></div>
  `;

  const cancelledPolicies =document.querySelector("#cancelledPolicies");
  cancelledPolicies.innerHTML = '';
  cancelledPolicies.innerHTML = `
  <div class="metric-label">Cancelled Policies</div>
        <div class="metric-number">${data.result.cancelledCount}<span style="color:#e05b5b;font-size:14px;margin-left:6px;">▼</span></div>
  `;

  const expiredPolicies =document.querySelector("#expiredPolicies");
  expiredPolicies.innerHTML = '';
  expiredPolicies.innerHTML = `
  <div class="metric-label">Expired Policies</div>
        <div class="metric-number">${data.result.expiredCount}<span style="color:#e05b5b;font-size:14px;margin-left:6px;">▼</span></div>
  `;

  const expiringPolicies =document.querySelector("#expiring");
  expiringPolicies.innerHTML = '';
  expiringPolicies.innerHTML = `
  <div class="metric-label">Policies Expiring in 30 Days</div>
        <div class="metric-number">${  data.result.expiringCount === undefined ? data.result.expiringCount : 0}<span style="color:#e05b5b;font-size:14px;margin-left:6px;">▼</span></div>
  `;
  console.log("Status of Policies :", data.result);
};

getStatus();


const handlePatientClick = (patientId) =>{
  currentPatientId = patientId;
  getPatientById(patientId);
  getPoliciesByPatient(patientId);
}

const getPatients = async () =>{
  const res = await fetch(`${url}/patients`);
  const data = await res.json();
  const patients = data.data;
  const container = document.querySelector("#card-container");
  container.innerHTML = '';
  patients.forEach((patient)=>{
      container.innerHTML +=  `
      <div class="list-item" onclick="handlePatientClick('${patient.id}')"
           id='${patient.id}'
           data-name="${patient.name}"
           data-phone="${patient.phone}"
           data-email="${patient.email ?? ''}"
      >
          <div>${patient.name}</div>
          <div>${patient.phone}</div>
          <div>${patient.city}</div>
          <div style="text-align:center">${patient.activePolicies}</div>
        </div>
      `
  });
  console.log(data);
}

getPatients();

const getPatientById = async (patientId) =>{
  currentPatientId = Number(patientId);  
  console.log("Profile loaded for:", currentPatientId);
  const res = await fetch(`${url}/patients/${patientId}`);
  const data = await res.json();
  const patient = document.querySelector("#profile");
  patient.innerHTML = `
        <div class="avatar"id="dp">
          <img src=${data.data.gender === 'MALE' ? "https://plus.unsplash.com/premium_photo-1671656349218-5218444643d8?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YXZhdGFyfGVufDB8fDB8fHww" : "https://plus.unsplash.com/premium_photo-1690407617542-2f210cf20d7e?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YXZhdGFyfGVufDB8fDB8fHww"} alt="avatar" style="width:84px;height:84px;object-fit:cover;border-radius:50%;" />
        </div>
        <div class="profile-info"  id="patientCard">
          <div class="name" >${data.data.name}</div>
          <div class="meta" id= ><strong>Age :</strong> ${data.data.age}&nbsp; • &nbsp; <strong>City :</strong>  ${data.data.city}</div>
          <div class="meta"><strong>Phone :</strong> +91 ${data.data.phone}</div>
          <div class="meta"><strong>Email :</strong> ${data.data.email}</div>
          <button 
        class="btn-primary btn-primary-add"
        onclick="openAddPolicyModal()">
        ＋ Add Policy
         </button>
         <button 
        class="btn-primary btn-primary-delete"
        onclick="deletePatient('${data.data.id}')">
        🗑 Delete         
        </button>
        </div>
  `
  console.log(data.data);
}


const getPoliciesByPatient = async (patientId) =>{
  if(patientId === null || patientId === undefined){
    patientId = 1;
  }
  const res = await fetch(`${url}/policies/${patientId}`)
  const data = await res.json();
  const policies = data.data;
  const table = document.getElementById("policies");
  table.innerHTML = '';
  policies.forEach((policy) =>{
    const start_date = new Date(policy.start_date).toLocaleDateString();
    const end_date = new Date(policy.end_date).toLocaleDateString();
   table.innerHTML += `
  <tr>
    <td>${policy.policy_number}</td>
    <td>${policy.plan_name}</td>
    <td>$${policy.sum_insured}</td>
    <td>${start_date}</td>
    <td>${end_date}</td>

    ${
      policy.status === 'cancelled'
        ? `
          <td>
            <span class="status">
              <span class="${policy.status === 'active' ? 'dot-green' : 'dot-red'}"></span>
              ${policy.status}
            </span>
          </td>
          <td>
            <button class="action-btn-disabled">
              Cancel
            </button>
            <button class="action-btn-disabled">
              Renew
            </button>
          </td>
        `
        : `
          <td>
            <span class="status">
              <span class="${policy.status === 'active' ? 'dot-green' : 'dot-red'}"></span>
              ${policy.status}
            </span>
          </td>
          <td>
            <button class="action-btn"
              onclick="cancelPolicy('${policy.policy_number}', '${policy.patient_id}')">
              Cancel
            </button>
            <button class="action-btn"
              onclick="renewPolicy('${policy.policy_number}', '${policy.patient_id}')">
              Renew
            </button>
          </td>
        `
    }
  </tr>
`;

  })
}


const cancelPolicy = async (policyId, patientId) =>{
  const res = await fetch(`${url}/policies/${policyId}/cancel`,{
    method : "PUT",
    headers:{
        "Content-Type": "application/json"
    }
  })
  const data = await res.json();
  if(data.success === true){
    getPoliciesByPatient(patientId);
    getStatus();
    getPatients();
  }
  console.log(data);
}


const renewPolicy = async (policyId,patientId) =>{
  const res = await fetch(`${url}/policies/${policyId}/renew`, {
    method: "PUT",
    headers: {
         "Content-Type": "application/json"
    }
  });
  const data = await res.json();
  if (data.success === true) {
    getPoliciesByPatient(patientId);
    getStatus();
    getPatients();
  }
  console.log(data);

}

const addPatient = async () => {
  const patientData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    age: document.getElementById("age").value,
    city: document.getElementById("city").value,
    gender: document.getElementById("gender").value
  };

  try {
    const res = await fetch(`${url}/patients/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(patientData)
    });

    const data = await res.json();

    if (data.success === true) {
      console.log("Patient ID:", data.patient);
      getPatients();
      closeModal();
      return data.patient; 
    } else {
      alert(data.message);
      return null;
    }

  } catch (err) {
    console.error(err);
    alert("Server error");
    return null;
  }
};

const showDefaultPatientUI = () =>{
  const def = document.getElementById("default-patient");
  def.innerHTML = `
  <div class="profile" id="profile">
        <div class="avatar"id="dp">
          <img src="https://thumbs.dreamstime.com/b/generated-image-372601986.jpg" alt="avatar" style="width:84px;height:84px;object-fit:cover;border-radius:50%;" />
        </div>
        <div class="profile-info"  id="patientCard">
          <div class="name" >Sarah Chen</div>
          <div class="meta" id= ><strong>Age:</strong> 34 &nbsp; • &nbsp; <strong>City:</strong> San Francisco</div>
          <div class="meta"><strong>Phone:</strong> (555) 123-4567</div>
          <div class="meta"><strong>Email:</strong> sarah.chen@email.com</div>
        </div>
      </div>

      <h3 style="margin:16px 6px 8px 6px; color:#17334f;">Policies</h3>

      <div class="policies" role="table" aria-label="Patient policies">
        <table>
          <thead>
            <tr>
              <td style="width:110px">Policy #</td>
              <td>Plan</td>
              <td style="width:110px">Sum Insured</td>
              <td style="width:110px">Start Date</td>
              <td style="width:110px">End Date</td>
              <td style="width:80px">Status</td>
              <td style="width:110px">Actions</td>
            </tr>
          </thead>
          <tbody id="policies">
            <tr>
              <td>HS-98765</td>
              <td>Gold Health</td>
              <td>$500,000</td>
              <td>01/15/2023</td>
              <td>01/14/2024</td>
              <td><span class="status"><span class="dot green"></span>Active</span></td>
              <td><button class="action-btn">Cancel</button> <button class="action-btn">Renew</button></td>
            </tr>
          </tbody>
        </table>
      </div>
  `
}

const deletePatient = async(patientId) =>{
  const res = await fetch(`${url}/patients/delete/${patientId}`,{
    method: "DELETE"
  });
  const data = await res.json();
  if(data.success){
    console.log("Patient deleted");
    getPatients();
    getStatus();
    showDefaultPatientUI(); 
  }
}

const addPolicy = async () => {
  const policyData = {
    patient_id: document.getElementById("policyPatientId").value,
    policy_number: document.getElementById("policyNumber").value,
    plan_name: document.getElementById("planName").value,
    sum_insured: document.getElementById("sumInsured").value,
    start_date: document.getElementById("startDate").value,
    end_date: document.getElementById("endDate").value
  };

  try {
    const res = await fetch(`${url}/policies/createPolicy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(policyData)
    });

    const data = await res.json();

    if (data.success) {
      closePolicyModal();
      getPoliciesByPatient(currentPatientId);
       getStatus();
      getPatients();
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
};


const searchBar = document.getElementById("searchBar");

searchBar.addEventListener("input",()=>{
  const searchValue = searchBar.value.toLowerCase().trim();
  const patientCards = document.querySelectorAll("#card-container .list-item");
  patientCards.forEach((card)=>{
    const name = card.dataset.name.toLowerCase();
    const email = card.dataset.email.toLowerCase();
    const phone = card.dataset.phone.toLowerCase();

    const isMatch = name.includes(searchValue) || email.includes(searchValue) || phone.includes(searchValue); 

    card.style.display = isMatch ? "grid" : "none";
  })
})



function openModal() {
  document.getElementById("patientModal").classList.add("active");
  document.getElementById("modalBackdrop").classList.add("active");
}

function closeModal() {
  document.getElementById("patientModal").classList.remove("active");
  document.getElementById("modalBackdrop").classList.remove("active");
}

function openAddPolicyModal() {
  if (!currentPatientId) {
    alert("Please select a patient first");
    return;
  }
  console.log("✅ Patient ID received:", currentPatientId);
  document.getElementById("policyPatientId").value = currentPatientId;
  document.getElementById("policyModal").classList.add("active");
  document.getElementById("modalBackdrop").classList.add("active");
}

function closePolicyModal() {
  document.getElementById("policyModal").classList.remove("active");
  document.getElementById("modalBackdrop").classList.remove("active");
}
