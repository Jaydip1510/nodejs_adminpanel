document.addEventListener('DOMContentLoaded', () => {
  const main_cat_drop = document.getElementById('main_cat_id');
  main_cat_drop.addEventListener('change', () => {
    const selectedValue = main_cat_drop.value;

    // Send an AJAX request to the Express server
    fetch(`/getalldata?selectedValue=${selectedValue}`)
      .then((response) => response.json())
      .then((data) => {
        let option = `<option value="">select Sub Category</option>`;
        data.forEach((e) => {
          option += `<option value="${e._id}">${e.name}</option>`;
        })
      
        $("#sub_cat_id").empty().append(option);
      })
      .catch((error) => {
        console.error('Error:', error);
      });

  });
    
});
