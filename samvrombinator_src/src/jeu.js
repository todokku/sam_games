import {Mot} from './mot.js';
import {mots} from './mots.js';
import {Message} from './message.js';
import {Dessin} from './dessin.js';


class Jeu extends React.Component {
    constructor(props){
        super(props)

        this.state = {mots: [],
                      longueur_partie: 1,
                      num_partie: 0,
                      mot: this.build_mot('vide'),
                      score_joueur: 0,
                      score_ordi: 0,
                      score_perdu: 5,
                      message: '',
                      color: '',
                      fin: false};

        this.creer_jeu = this.creer_jeu.bind(this);
        this.shuffle_mots = this.shuffle_mots.bind(this);
        this.build_mot = this.build_mot.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.set_score = this.set_score.bind(this);
    }
    componentDidMount(){
        function GetURLParameter(sParam)
        {
            var sPageURL = window.location.search.substring(1);
            var sURLVariables = sPageURL.split('&');
            for (var i = 0; i < sURLVariables.length; i++)
            {
                var sParameterName = sURLVariables[i].split('=');
                if (sParameterName[0] == sParam)
                {
                    return sParameterName[1];
                }
            }
        };
        var voc = GetURLParameter('voc_selected');
        var score_perdu = GetURLParameter('nb_errors') ? parseInt(GetURLParameter('nb_errors')) + 1 : this.state.score_perdu;
        var fetch_url = voc ? './get_words' + '?voc=' + voc : './get_words';
        var response = fetch(fetch_url).then(response => response.json()).then(data => {
            var list_mots = this.shuffle_mots(data['words']);
            if (GetURLParameter('nb_words') && parseInt(GetURLParameter('nb_words')) < list_mots.length){
                var longueur_partie = parseInt(GetURLParameter('nb_words'));
            }
            else {
                var longueur_partie = list_mots.length;
            }
            this.setState({mots: list_mots,
                           score_perdu: score_perdu,
                           longueur_partie: longueur_partie})
            this.creer_jeu();

        });

    }
    creer_jeu() {
        this.setState({num_partie: this.state.num_partie+1,
                       mot: this.build_mot(this.state.mots[this.state.num_partie]),
                       score_joueur: 0,
                       score_ordi: 0}, this.transform_dessin);
    }
    check_score_ordi(){
        this.transform_dessin();
        if (this.state.score_ordi == this.state.score_perdu) {
            this.setState({message:'PERDU !',
                           color:'rose',
                           mot:this.state.mot.map((value,index) => {return {carac:value.carac, hide:false}}),
                           fin:true});
            this.fin_partie();
        }

    }
    check_score_joueur(){
        this.transform_dessin();
        if (this.state.score_joueur === this.state.mot.length){
            if (this.state.longueur_partie > this.state.num_partie) {
                this.setState({message:'Bravo !',
                               color:'rose'})
                setTimeout(()=>{this.setState({message:'',
                                              color:'rose'});
                                this.creer_jeu()}, 2000)
            } else {
                this.setState({message:'GAGNÉ !',
                               color:'rose',
                               fin:true});
                this.fin_partie();
            }
        }
    }
    set_score(){
        let temp_score = this.state.mot.filter(value => !value.hide).length;
        if (this.state.score_joueur < temp_score) {
            this.setState({score_joueur: temp_score}, this.check_score_joueur);
        } else {
            this.setState({score_ordi: this.state.score_ordi + 1}, this.check_score_ordi);
        }
    }
    transform_dessin(){
        var largeur = jQuery('#dessin').width() - 340;
        jQuery('#fusee-b').animate({'left': String(largeur/this.state.score_perdu*this.state.score_ordi + 200)+'px'}, 1000);
        jQuery('#fusee-r').animate({'left': String(largeur/this.state.mot.length*this.state.score_joueur + 200)+'px'}, 1000);

    }
    build_mot(mot){
        return mot.split('').map((value, index) => {return {'carac':value, 'hide': true}});
    }
    test_key(key, carac){
        carac = carac.toLowerCase().replace(/[àäâ]/g,"a").replace(/[éèêë]/g,"e").replace(/[öô]/g,"o").replace(/[ùü]/g,"u");
        return carac == key.toLowerCase()?true:false;
    }
    handleKeyPress(event){
        var pressed_carac = event.key;
        this.setState({mot:this.state.mot.map((value,index) => {return {carac:value.carac, hide: (!value.hide||this.test_key(pressed_carac,value.carac)?false:true)}})});
        this.set_score();
    }
    fin_partie(){
        document.removeEventListener('keypress', this.handleKeyPress);
        jQuery('#fin').css("font-size", "100px")
    }
    shuffle_mots(mots) {
        var array = new Array();
        mots.map((e)=>array.push(e));

        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array
    }
    render() {
        return (<div>
                    <div className="container mt-4">
                        <div className="card">
                            <Mot mot={this.state.mot} handleKeyPress={this.handleKeyPress} />
                        </div>
                    </div>
                    <Message message={this.state.message} />
                    <Dessin />
                </div>
        );
    }
}
ReactDOM.render( <Jeu /> ,
  document.getElementById('root')
);
