/*
SaleTypeSelector selects current sale type in variable cur_sale.
AttributeTypeSelector selects current attribute type in variable cur_attribute_type.
AddValue2Selector adds all selectable values of current attribute type to the list of the value selector.
AttributeValueSelector selects values that user chooses and stores them in Set cur_attribute_value.

All variable/elements in Set is string type and exactly same with texts in vg_games dataset,
when you read the a data, you can straightly judge whether they are equal or not for selecting this data into current dataset or not.
 */
function SaleTypeSelector(obj) {
    cur_sale = obj.options[obj.selectedIndex].value;
}

function AttributeTypeSelector(obj) {
    if(cur_attribute_type != obj.options[obj.selectedIndex].value)
    {
        cur_attribute_type = obj.options[obj.selectedIndex].value;
        AddValue2Selector();
    }
}

function AddValue2Selector() {
    $('#AttributeValue').empty();
    let opts = '<option value="All">All</option>';
    if(cur_attribute_type == 'none') return;
    else if (cur_attribute_type == 'Platform')
    {
        for (let i of platforms) {
            opts += '<option value="' + i + '">' + i + '</option>';
        }
        $('#AttributeValue').append(opts);
        $('#AttributeValue').selectpicker('refresh');
    }
    else if (cur_attribute_type == 'Genre')
    {
        for (let i of genres) {
            opts += '<option value="' + i + '">' + i + '</option>';
        }
        $('#AttributeValue').append(opts);
        $('#AttributeValue').selectpicker('refresh');
    }
    else {
        for (let i of publishers) {
            opts += '<option value="' + i + '">' + i + '</option>';
        }
        $('#AttributeValue').append(opts);
        $('#AttributeValue').selectpicker('refresh');
    }
}

function AttributeValueSelector(obj) {
    cur_attribute_value.clear();
    $('#AttributeValue').find('option:selected').each(function () {
        cur_attribute_value.add($(this).val());
    })
    console.log(cur_attribute_value);
}