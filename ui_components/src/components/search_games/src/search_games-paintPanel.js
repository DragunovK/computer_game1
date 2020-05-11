/**
 * Paint panel.
 */

let selected_genre = "concept_computer_game";

let collectionOfGameSctpID;

function change_genre(new_value) {
	selected_genre = new_value;
}


function find(self,container) {

	let game_name_filter = document.getElementById("search_text_field").value;

	let publisher_filter = document.getElementById("publisher_filter").value;

    let getAllGamesID = self._moba();
	
		let getAllGamesName = getAllGamesID.then((array) => {
			collectionOfGameSctpID = array;
			return self._getName(array);
		});

		let getAllGamePublisherID = getAllGamesID.then(self._publishers);

		let getAllGamePublisherName = getAllGamePublisherID.then((array) => {
			collectionOfPublisherSctpID = array;
			return self._getName(array);
		})

    Promise.all([getAllGamesName, getAllGamePublisherName]).then((result) => {

			setTimeout(function(){
				setTimeout(function(){
					let sizeOfResult = Math.max(result[0].length, result[1].length);
	
					let gamesName = [];
					let publishersName = [];
				
					let newCollectionOfGameSctpID  = [];
					let newCollectionOfPublisherSctpID = [];
	
					for (let i = 0; i < sizeOfResult; i++) {
						let game_name_filter_condition = (result[0][i].toLowerCase().includes(game_name_filter.toLowerCase()));
	
						let publisher_filter_condition;
						for ( let j = 0; j < result[1][i].length; j += 1 ) {
							publisher_filter_condition = (result[1][i][j].toLowerCase().includes(publisher_filter.toLowerCase()));
							if (publisher_filter_condition) {
								break;
							}
						}
	
						if (game_name_filter_condition && publisher_filter_condition) {
	
							gamesName.push(result[0][i]);
							newCollectionOfGameSctpID.push(collectionOfGameSctpID[i]);
	
							publishersName.push(result[1][i]);
							newCollectionOfPublisherSctpID.push(collectionOfPublisherSctpID[i]);
	
						 }
					}
					self._configurateTable(gamesName,publishersName, newCollectionOfGameSctpID, newCollectionOfPublisherSctpID,  container);
				},500)
			},2200)
		

		})
	}

Example.PaintPanel = function (containerId) {
    this.containerId = containerId;
};

Example.PaintPanel.prototype = {

    init: function () {
        this._initMarkup(this.containerId);
    },

    _initMarkup: function (containerId) {
        var container = $('#' + containerId);

        var self = this;
		container.append(`
			<div class = "">
				Дополнительные настройки поиска
				<br>
				<p>
					<select class = "select_genre" onchange="change_genre(this.value);">
						<option value = "concept_computer_game">Любой жанр</option>
						<option value = "concept_MOBA" >MOBA</option>
						<option value = "concept_horror" >horror</option>
						<option value = "concept_MMORPG" >MMORPG</option>
					</select>
					<input type = "text" id = "publisher_filter" placeholder = "Фильтр издателя">
				</p>
			</div>`
		);
		
		container.append('<div><input type = "text" id = "search_text_field" placeholder = "Введите название игры" display:inline-block> <button id = "find_by_text" type = "button" display:inline-block>FIND</button></div>');


		SCWeb.core.Server.resolveScAddr(['ui_menu_na_keynodes'], function (keynodes) {
			$('#moveToNavigationNode').attr("sc_addr", keynodes['ui_menu_na_keynodes']);
		});

	
		$('#find_by_text').click(function () {
			find(self, container);
		});
	},

	_configurateTable: function(array_of_game_names,array_of_publishers, collectionOfGameSctpID, publishersSctpID, container){
		console.log("Составляем таблицу");

		if(container[0].lastChild === document.getElementsByTagName("table")[0]){
			console.log(`не первый раз`);
			container[0].lastChild.remove();
		}

		let insertIntoTable = `<tr><th onclick="sortTable(0)">название игры</th><th onclick="sortTable(1)">издатель</th></tr>`;

	

		for(let i = 0; i < array_of_game_names.length; i += 1 ) { 
			console.log("получили массив,размером = " + array_of_publishers[i].length);		
			insertIntoTable += '<tr style = "border: 1px solid black">';
			insertIntoTable +=`<td style = "border: 1px solid black"><a href = "${collectionOfGameSctpID[i]}" class = "link_internal"> ${array_of_game_names[i]}</a></td>`;
			
			insertIntoTable +=`<td style = "border: 1px solid black">`;
			for(let j = 0; j < array_of_publishers[i].length; j += 1) {
				insertIntoTable +=`<a href = "${publishersSctpID[i][j]}" class = "link_internal"> ${array_of_publishers[i][j]}</a>`;
			}
			insertIntoTable +=`</td>`;

			insertIntoTable +='</tr>';
		}
		container.append('<table id = "table" style = "border: 1px solid black  border-collapse: collapse">' + insertIntoTable + '</table>');
		return true;
	},

	_getName: function(array_of_sctp_ID){

		let nameArray = [];

		let main_menu_addr, nrel_main_idtf_addr;

		let promise = new Promise(function(resolve, reject) {

			SCWeb.core.Server.resolveScAddr(['nrel_main_idtf'], function (keynodes) {
			
				if ( Array.isArray(array_of_sctp_ID[0] )) {

					console.log("это двумерный массив");

					setTimeout(function(){
					let flagOfEnd = false;
					for( let i = 0; i < array_of_sctp_ID.length; i += 1 ) {
						nrel_main_idtf_addr = keynodes['nrel_main_idtf'];
						nameArray[i] = [];
						let j = 0;
						console.log(array_of_sctp_ID[i]);
						console.log("size = " + array_of_sctp_ID[i].length);
						for( j = 0; j < array_of_sctp_ID[i].length; j += 1 ) {
							console.log("jt = " + j);
							main_menu_addr = array_of_sctp_ID[i][j];

							window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
								main_menu_addr,
								sc_type_arc_common | sc_type_const,
								sc_type_link,
								sc_type_arc_pos_const_perm,
								nrel_main_idtf_addr])
								.done(function(identifiers){	 
									window.sctpClient.get_link_content(identifiers[0][2],'string').done(function(content){
										nameArray[i].push(content);
									})
					 
							 });
						
							 if (j === array_of_sctp_ID[i].length - 1 ) {
								 flagOfEnd = true;
							 }
						}
						if ( i === array_of_sctp_ID.length - 1) {
							console.log("it is the end of i ");
							 if (flagOfEnd) {
								console.log("it is the end of j ");
								console.log("Вернули такой массив имен; " + nameArray.length);
								 resolve(nameArray);
							 }
					 }

					 flagOfEnd = false;
					}

				},800)
				} else {
					console.log("это одномерный массив");
					for( let i = 0; i < array_of_sctp_ID.length; i += 1 ) {

						main_menu_addr = array_of_sctp_ID[i];
						nrel_main_idtf_addr = keynodes['nrel_main_idtf'];
	
						window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
							 main_menu_addr,
							 sc_type_arc_common | sc_type_const,
							 sc_type_link,
							 sc_type_arc_pos_const_perm,
							 nrel_main_idtf_addr])
						.done(function(identifiers){	 
							 window.sctpClient.get_link_content(identifiers[0][2],'string').done(function(content){
								 nameArray[i] = content;
							 })
				
						});
						if ( i === array_of_sctp_ID.length - 1) {
							resolve(nameArray);
						}
					}
				}
				
			});
		});
		return promise;
	},

	_publishers: function(array_of_games_SCTP_ID){
		let publishersSctpID = [];
		let promise = new Promise(function(resolve, reject) {
			SCWeb.core.Server.resolveScAddr(['nrel_publisher'], function (keynodes) {

				let publisher_nrel = keynodes['nrel_publisher'];
				
	
				for( let i = 0; i < array_of_games_SCTP_ID.length; i += 1 ) {
				
					let main_menu_addr = array_of_games_SCTP_ID[i];
					
					publishersSctpID[i] = [];
	
					window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
						main_menu_addr,
						sc_type_arc_common | sc_type_const,
						sc_type_node | sc_type_const,/// компания-издатель
						sc_type_arc_access | sc_type_const | sc_type_arc_pos | sc_type_arc_perm,
						publisher_nrel])
					.done(function(identifiers){
						for (let j = 0; j < identifiers.length; j += 1 ) {
							publishersSctpID[i][j] = (identifiers[j][2])
						}
						if(publishersSctpID.length ===  array_of_games_SCTP_ID.length ){
							resolve(publishersSctpID);
						} else if (identifiers.length === 0){
							reject("netu izdatelya")
						}
					})
				}
			});
		});
		return promise;
	
    },
        
	_moba: function() {
		let promise = new Promise(function(resolve, reject) {
			let gGameNamesID = [];
			var main_menu_addr;
			// Resolve sc-addrs.
			SCWeb.core.Server.resolveScAddr([selected_genre], function (keynodes) {
				main_menu_addr = keynodes[selected_genre];
	
				// Resolve sc-addr of ui_menu_view_full_semantic_neighborhood node
				window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_3F_A_A, [
					 main_menu_addr,
					 sc_type_arc_access | sc_type_const | sc_type_arc_pos | sc_type_arc_perm,
					 sc_type_node | sc_type_const | sc_type_node_class])
				.done(function(identifiers){

					for ( let i = 0; i < identifiers.length; i++ ) {
						gGameNamesID.push(identifiers[i][2]);
					}	
				
					if ( gGameNamesID.length === identifiers.length){

                        resolve(gGameNamesID);
                        
					} else if (gGameNamesID.length) { 

                        reject("not found");
                        
					}
				});
			});
		});
		return promise;
	}
};