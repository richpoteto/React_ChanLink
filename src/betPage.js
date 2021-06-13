import React, { Component } from 'react'
import Web3 from 'web3';
import BettingContract from './abi/bettingContract.json'
import {TextField, Button} from '@material-ui/core';
var moment = require('moment'); // require
moment().format(); 

export default class betPage extends Component {

    async componentWillMount(){
        await this.loadWeb3();
        await this.loadBlockchainData();
        
    }

    async loadWeb3() {
        if (window.ethereum) {
          window.web3 = new Web3(window.ethereum)
          await window.ethereum.enable()
        }
        else if (window.web3) {
          window.web3 = new Web3(window.web3.currentProvider)
        }
        else {
          window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    }

    async loadBlockchainData(){
        const web3 = window.web3;
        const accounts = await web3.eth.getAccounts();
        this.setState({account:accounts[0]})

        const networkId =  await web3.eth.net.getId();
        console.log(networkId)

        const bettingContract = new web3.eth.Contract(BettingContract, '0x5924989158a789948574A6a5c2B8659E704F96aa');
        this.setState({bettingContract});

    }

    constructor(){
        super()
        this.state={
            betID:'',
            loading1:false,
            betCreationTime:'',
            betEndingTime:'',
            betAmount:'',
            userUp:'',
            userDown:'',
            prediction:'',
            open:'',
            loading2:false,
            loading3:false,
            display:'none'
        }
    }

    getBetDetails = async() =>{
        let web3 = window.web3;
        await this.setState({loading1:true})
        let details = await this.state.bettingContract.methods.bets(this.state.betID).call()
        var display1;
        if (details.userDown==='0x0000000000000000000000000000000000000000' || details.userUp==='0x0000000000000000000000000000000000000000'){
            display1 = ''
        }
        else{
            display1 = 'none'
        }
        await this.setState({
            betCreationTime : details.creationTime,
            betEndingTime : details.endTime,
            open : details.open,
            prediction : details.prediction,
            betAmount : web3.utils.fromWei(details.betAmount, 'ether'),
            userUp : details.userUp,
            userDown : details.userDown,
            loading1:false,
            display:display1

        })
        console.log(details) 
    }

    participateInBet = async() =>{
        let web3 = window.web3;
        await this.setState({loading2:true})

        await this.state.bettingContract.methods.participateInBet(this.state.betID).send({from:this.state.account, value:web3.utils.toWei(this.state.betAmount, "ether")}).on('transactionHash', (hash)=>{
            this.setState({transactionHash:hash});
        })
        await this.setState({loading2:false})
    }

    getResult = async() =>{

        await this.setState({loading3:true})

        await this.state.bettingContract.methods.getResult(this.state.betID).send({from:this.state.account}).on('transactionHash', (hash)=>{
            this.setState({transactionHash:hash});
        })
        await this.setState({loading3:false})
    }

    render() {
        return (
            <div style={{backgroundColor:'lightgrey', height:'1000px'}}>
                <center>
                <br/><br/><br/>
                <br/><br/><br/>

                <TextField
                    type='number'
                    id="outlined"
                    variant="outlined"
                    placeholder='Bet ID to Load'
                    style={{height:'50px', width:'300px'}}
                    onChange={(e)=>{this.setState({betID:e.target.value})}}
                />
                <br/><br/><br/>

                <Button 
                    style={{width:'300px', height:'50px'}}
                    variant="contained"
                    onClick={this.getBetDetails}
                >
                {this.state.loading1? 'Loading... Please Wait.':'View Bet Details'}
                </Button>

                <br/><br/><br/><br/>
                <b>Bet Creation Time : </b>{ moment.utc(this.state.betCreationTime*1000).toString()} <br/><br/>
                <b>Bet Ending Time : </b> { moment.utc(this.state.betEndingTime*1000).toString()} <br/><br/>
                <b>Bet Amount : </b> {this.state.betAmount} Ether <br/><br/>
                <b>Prediction Amount :</b> {this.state.prediction} USD <br/><br/>
                <b>Bullish User : </b> {this.state.userUp} <br/><br/>
                <b>Bearish User : </b>  {this.state.userDown} <br/><br/>
                

                <br/><br/><br/>

                <Button 
                    
                    style={{width:'300px', height:'50px', display:this.state.display}}
                    variant="contained"
                    onClick={this.participateInBet}
                >
                {this.state.loading2? 'Loading... Please Wait.':'Participate in Bet'}
                </Button>

                <br/><br/><br/>

                <Button 
                    
                    style={{width:'300px', height:'50px'}}
                    variant="contained"
                    onClick={this.getResult}
                >
                {this.state.loading3? 'Loading... Please Wait.':'Get Bet Result'}
                </Button>
                </center>
            </div>
        )
    }
}
