import React, { Component } from 'react'
import Web3 from 'web3';
import BettingContract from './abi/bettingContract.json'
import {TextField, Button} from '@material-ui/core';


export default class createBet extends Component {

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

        const bettingContract = new web3.eth.Contract(BettingContract, '0x835beeEa762Ad5bc30ab1dD038e58b192e31DfB5');
        this.setState({bettingContract});

    }

    releaseNewBet = async()=>{
        let web3 = window.web3;
        await this.setState({loading:true})
        let _date = new Date(this.state.date);
        let year = _date.getFullYear();
        let month = _date.getMonth();
        let date = _date.getDate();
        let hour = _date.getHours();
        let min = _date.getMinutes();
        let _date2 = new Date( Date.UTC(year,month,date,hour, min));
        var myEpoch = _date2.getTime()/1000.0;
        var myEpoch2 = myEpoch.toString();

        await this.state.bettingContract.methods.createBet(this.state.prediction, this.state.up, myEpoch2).send({from:this.state.account, value:web3.utils.toWei(this.state.betPrice, "ether")}).on('transactionHash', (hash)=>{
            this.setState({transactionHash:hash});
        })
        let betID = await this.state.bettingContract.methods.counter().call()
        
        await this.setState({loading:false, betID})

    }

    constructor(){
        super()
        this.state={
            account:'0x0',
            bettingContract:{},
            loading:false,
            date:'',
            prediction:'0',
            up:true,
            betPrice:'',
            betID:''

        }
    }

    render() {
        return (
            <div style={{backgroundColor:'lightgrey', height:'1000px'}}>
                <center>
                <br/><br/><br/><br/>
                <h1>CREATE A NEW BET</h1>
                <br/>
                <TextField
                    id="outlined"
                    type='number'
                    variant="outlined"
                    placeholder='Prediction'
                    style={{height:'50px', width:'300px'}}
                    onChange={(e)=>{this.setState({prediction:e.target.value})}}
                />
                <br/>
                <br/>
                <TextField
                    type='number'
                    id="outlined"
                    variant="outlined"
                    placeholder='1 if Up, 0 if Down than Prediction Price '
                    style={{height:'50px', width:'300px'}}
                    onChange={(e)=>{
                        if(parseInt(e.target.value)===0){
                            this.setState({up:false})
                        }
                        else if(parseInt(e.target.value===1)){
                            this.setState({up:true})
                        }
                    }}
                />
                <br/>
                <br/><br/>
                <TextField
                    id="datetime-local"
                    style={{width:'90%', maxWidth:'300px'}}
                    label="Bet End Time (UTC)"
                    type="datetime-local"
                    defaultValue="2017-05-24T10:30"
                    onChange = {(e)=>{this.setState({date:e.target.value})}}
                    InputLabelProps={{
                    shrink: true,
                    }}  
                />
                <br/>
                <br/>
                <TextField
                    type='number'
                    id="outlined"
                    variant="outlined"
                    placeholder='Betting Price in Ether'
                    style={{height:'50px', width:'300px'}}
                    onChange={(e)=>{this.setState({betPrice:e.target.value})}}
                />
                <br/><br/><br/>
                <Button 
                    style={{width:'300px', height:'50px'}}
                    variant="contained"
                    onClick={this.releaseNewBet}
                >
                {this.state.loading? 'Loading... Please Wait.':'Create Bet'}
                </Button>

                <br/><br/><br/><br/>
                <b>Bet ID (Valid on Successful Transaction): {this.state.betID}</b>
                

                </center>
                
            </div>
        )
    }
}
