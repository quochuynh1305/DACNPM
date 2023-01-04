$(document).ready(function () {
    var table = $('#table-singer').DataTable({
        "language": {
            "lengthMenu": "Hiển thị _MENU_ dòng trong trang",
            "zeroRecords": "Không có kết quả tìm thấy!",
            "info": "Trang _PAGE_ trong tổng số _PAGES_ trang",
            "infoEmpty": "Không có trang",
            "infoFiltered": "(Lọc từ tổng số _MAX_ kết quả)",
            "search":         "Tìm kiếm:",
            "paginate": {
                "first":      "Đầu",
                "last":       "Cuối",
                "next":       "Tiếp theo",
                "previous":   "Trở về"
            }
        },
        columnDefs: [
            { orderable: false, targets: 2 }
        ], dom: '<"overflow-auto"lf><B>rtip',
        buttons: [
            {
                text: 'Xóa nghệ sĩ',
                className : 'btn btn-danger btn-sm disabled',
                action: function ( e, dt, node, config ) {
                    let array = []
                    $(".no-switch-parent input:checked").each( function (){
                        array.push($(this).val())
                    })
                    Swal.fire({
                        title: `Bạn có chắc chắn xóa ${countChecked()} dòng`,
                        text: "Bạn không thể khôi phục sau khi xóa",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Xóa',
                        cancelButtonText: 'Hủy bỏ',
                        showLoaderOnConfirm: true,
                        preConfirm: () => {
                            return fetch("/deleteSinger",{
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(array)
                            })
                                .then(response => {
                                    if (!response.ok) {
                                        throw new Error(response.statusText)
                                    }
                                    return response.json()
                                })
                                .catch(error => {
                                    Swal.showValidationMessage(
                                        "Xóa không thành công !"
                                    )
                                })
                        },
                        allowOutsideClick: () => !Swal.isLoading()
                    }).then((result) => {
                        if (result.isConfirmed) {
                            if (result.value.data){
                                dt.rows( '.selected' )
                                    .remove()
                                    .draw();
                                $(".btn-danger").addClass("disabled")
                                Swal.fire(
                                    'Đã xóa',
                                    'Bạn đã xóa thành công',
                                    'success'
                                )
                            }

                        }
                    })

                }
            },
            {
                text: 'Thêm nghệ sĩ',
                className : 'btn btn-success btn-sm ms-4',
                action: async function (e, dt, node, config) {
                    const {value: singer} = await Swal.fire({
                        title: 'Thêm mới nghệ sĩ',
                        input: 'text',
                        inputLabel: 'Vui lòng nhập tên nghệ sĩ:',
                        inputPlaceholder: 'Điền tên nghệ sĩ ở đây!',
                        showCancelButton: true,
                        cancelButtonColor: '#d33',
                        cancelButtonText: 'Hủy bỏ'
                    })
                    if (singer) {
                        fetch("/addSinger",{
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: singer
                        })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error(response.statusText)
                                }
                                return response.json()
                            }).then((result) => {
                                if (result) {
                                    if (result.data){
                                        table.row.add([`<div class="form-check no-switch-parent"><input class="form-check-input no-switch" type="checkbox" value=${result.data.id}>
                                    <label class="form-check-label" >
                                            ${result.data.id}
                                    </label></div>`,result.data.name,`<i class="fa-solid fa-pen-to-square" data-name = ${result.data.name} data-id=${result.data.id}></i>`]).draw()
                                        Swal.fire(
                                            'Đã thêm',
                                            'Bạn đã thêm thành công',
                                            'success'
                                        )
                                    }
                                }
                            })
                            .catch(error => {
                                Swal.showValidationMessage(
                                    "Thêm không thành công !"
                                )
                            })
                    }
                }
            }
        ]
    });

    function  countChecked(){
        return $(".selected").length
    }
    $("#table-singer").on("click" ,".no-switch",function (){
        let checked = $(this).prop("checked")
        checked ? $(this).parents('tr').addClass('selected') : $(this).parents('tr').removeClass('selected')
        countChecked()===0?$(".btn-danger").addClass("disabled"):$(".btn-danger").removeClass("disabled")
    })

    $("#table-singer ").on("click",".fa-solid.fa-pen-to-square",async function () {
        let object = {id : $(this).attr('data-id'),
                      name : $(this).attr('data-name') }
        let  row = $(this).parents('tr')[0]
        let name = $(this).attr('data-name')

        const {value: singer} = await Swal.fire({
            title: 'Chỉnh sửa tên nghệ sĩ',
            input: 'text',
            inputLabel: 'Vui lòng nhập tên mới cho nghệ sĩ:',
            inputPlaceholder: 'Điền tên mới cho nghệ sĩ ở đây!',
            showCancelButton: true,
            cancelButtonColor: '#d33',
            cancelButtonText: 'Hủy bỏ',
            inputValidator: (value) => {
                if(value===name)
                    return 'Vui lòng điền tên khác!'
                if(!value){
                    return 'Vui lòng điền tên vào ô trống!'
                }
            }
        })

        if (singer && !(name===singer) && !(singer==="")) {
            object.name = singer;
            fetch("/updateSinger", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(object)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(response.statusText)
                    }
                    return response.json()
                }).then((result) => {
                if (result) {
                    if (result.data) {
                        table.row(table.row(row).index()).data([`<div class="form-check no-switch-parent"><input class="form-check-input no-switch" type="checkbox" value=${result.data.id}>
                                    <label class="form-check-label" >
                                            ${result.data.id}
                                    </label></div>`,result.data.name,`<i class="fa-solid fa-pen-to-square" data-name = ${result.data.name} data-id=${result.data.id}></i>`]).draw();
                        Swal.fire(
                            'Đã chỉnh sửa',
                            'Bạn đã chỉnh sửa thành công',
                            'success'
                        )
                    }
                }
            })
                .catch(error => {
                    Swal.showValidationMessage(
                        "Chỉnh sửa không thành công !"
                    )
                })
        }
    })
});