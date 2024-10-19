document.addEventListener('DOMContentLoaded', () => {
  const dropdown = document.getElementById('dispcat_id');
  const resultDiv = document.getElementById('result');

  dropdown.addEventListener('change', () => {

    const selectedValue = dropdown.value;

    // Send an AJAX request to the Express server
    fetch(`/getalldata?selectedValue=${selectedValue}`)
      .then((response) => response.json())
      .then((data) => {
        let tr = '';
        data.forEach((e) => {
          tr += `<tr align="center"><td>${e._id}</td><td>${e.cat_id.categoryname}</td><td>${e.name}</td><td><a class="btn btn-success" href="/subcategortedit/${e._id}">Edit</a>&nbsp;<a  class="btn btn-danger" href="/subcat/deletedata/${e._id}">Delete</a></td></tr>`;
        })
        resultDiv.innerHTML = tr;
      })
      .catch((error) => {
        console.error('Error:', error);
      });

  });


  const searchbox = document.getElementById('search');

  searchbox.addEventListener('keyup', () => {

    const selectedValue = searchbox.value;

    // Send an AJAX request to the Express server
    fetch(`/filteralldata?selectedValue=${selectedValue}`)
      .then((response) => response.json())
      .then((data) => {
        let tr = '';
        data.forEach((e) => {
          tr += `<tr align="center"><td>${e._id}</td><td>${e.cat_id.categoryname}</td><td>${e.name}</td><td><a class="btn btn-success" href="/subcategortedit/${e._id}">Edit</a>&nbsp;<a  class="btn btn-danger" href="/subcat/deletedata/${e._id}">Delete</a></td></tr>`;
        })
        resultDiv.innerHTML = tr;
      })
      .catch((error) => {
        console.error('Error:', error);
      });

  });
});
