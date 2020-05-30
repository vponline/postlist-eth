import Web3 from 'web3';
import PostList from '../build/contracts/PostList.json';

// Define global variables
// web3 for the wallet
let web3;
// postlist for the smart contract instance
let postlist;

// Set the web3 wallet with Metamask
const initWeb3 = () => {
    return new Promise((resolve, reject) => {
      // New metamask
      if(typeof window.ethereum !== 'undefined') {
        const web3 = new Web3(window.ethereum);
        window.ethereum.enable()
          .then(() => {
            resolve(
              new Web3(window.ethereum)
            );
          })
          .catch(e => {
            reject(e);
          });
        return;
      }
      // Old metamask
      if(typeof window.web3 !== 'undefined') {
        return resolve(
          new Web3(window.web3.currentProvider)
        );
      }
      // If there is no metamask, set to local truffle blockchain
      resolve(new Web3('http://localhost:9545'));
    });
  };

  // Set the instance of the smart contract
  const initContract = () => {
    // Get the network number, ABI and contract address from the contract json file in the /build folder
    const deploymentKey = Object.keys(PostList.networks)[0];
    // Return a new instance of the contract
    return new web3.eth.Contract(
      PostList.abi, 
      PostList.networks[deploymentKey].address
    );
  };

  const initApp = () => {
    const create = document.getElementById('create');
    const createResult = document.getElementById('create-result');
    const createTransactionHash = document.getElementById('create-transactionhash');
    const createDetails = document.getElementById('create-details');
    const find = document.getElementById('find');
    const findResult = document.getElementById('find-result');
    const findAll = document.getElementById('findall');
    const findAllResult = document.getElementById('findall-result');
    const findAllBtn = document.getElementById('findall-btn');
    const update = document.getElementById('update');
    const updateResult = document.getElementById('update-result');
    const updateTransactionHash = document.getElementById('update-transactionhash');
    const updateDetails = document.getElementById('update-details');
    const remove = document.getElementById('remove');
    const removeResult = document.getElementById('remove-result');
    const removeTransactionHash = document.getElementById('remove-transactionhash');
    const removeDetails = document.getElementById('remove-details');
    const currentAccount = document.getElementById('account');
    const accountShort = document.getElementById('account-short');
    const network = document.getElementById('network');
    const postCount = document.getElementById('post-count');
    const ethereumButton = document.querySelector('.enableEthereumButton');
    const findAllSpinner = document.querySelector('.findall-spinner');
    const findSpinner = document.querySelector('.find-spinner');
    const createSpinner = document.querySelector('.create-spinner');
    const removeSpinner = document.querySelector('.remove-spinner');
    const updateSpinner = document.querySelector('.update-spinner');
    
    let accounts = [];

    const getAccounts = () => {
      ethereumButton.innerHTML = `<span class="material-icons">wifi</span>Connected`;
      ethereumButton.classList.remove('btn-outline-danger');
      ethereumButton.classList.add('btn-outline-success');
      accountShort.innerHTML = `<span class="material-icons">account_balance_wallet</span>${accounts[0].toLowerCase().substring(0,6)}...${accounts[0].toLowerCase().substring(38,42)}`;
      currentAccount.innerHTML = `<a class="d-flex text-info" rel="noopener noreferrer" target="_blank" href="https://ropsten.etherscan.io/address/${accounts[0].toLowerCase()}">${accounts[0].toLowerCase()}&nbsp;<span class="material-icons">open_in_new</span></a>`; 
    }

    const resetAccounts = () => {
      ethereumButton.addEventListener('click', () => {
        initWeb3()
          .then(_web3 => {
            web3 = _web3;
          })
          .catch(err => console.log(err.message));
      }, {once : true})
        ethereumButton.innerHTML = `<span class="material-icons">wifi_off</span>Connect wallet`;
        ethereumButton.classList.remove('btn-outline-success');
        ethereumButton.classList.add('btn-outline-danger');
        accountShort.innerHTML = `<span class="material-icons">lock</span>Details`;
        currentAccount.innerHTML = 'No wallet connected';
        network.innerHTML = 'No network detected. Try connecting your wallet.';
        postCount.innerHTML = 'Check network and wallet connections.';
    }

    web3.eth.getAccounts().then(_accounts => {
        accounts = _accounts;
        getAccounts();
    });

    window.ethereum.on('accountsChanged', function (newAccounts) {
        accounts = newAccounts;

        if(ethereum.selectedAddress === null) {
          resetAccounts();
        } else {
          getAccounts();
          getNetwork();
          getPostCount();
        }
      });

    const getNetwork = () => {
      web3.eth.net.getId()
      .then((id) => {
          switch(id) {
              case 1: return network.innerHTML = 'Mainnet';
              case 3: return network.innerHTML = 'Ropsten';
              case 4: return network.innerHTML = 'Rinkeby';
              case 5: return network.innerHTML = 'Goerli';
              case 42: return network.innerHTML = 'Kovan';
              default: return network.innerHTML = `Local/development (id: ${id})`;
            }
        });
    }
    getNetwork();

    const getPostCount = () => {
      postlist.methods.postCount()
        .call()
        .then((result) => {
            postCount.innerHTML = result-1;
        });
    }
    getPostCount();

    create.addEventListener('submit', e => {
        e.preventDefault();
        createSpinner.style.display = "block";
        const content = e.target.elements[0].value;
        postlist.methods.createPost(content)
          .send({from: accounts[0]})
          .on('transactionHash', (hash) => {
            createResult.style.display = "none";
            createDetails.style.display = "none";
            createTransactionHash.style.display = "block";
            createTransactionHash.innerHTML = `
            <div class="alert alert-primary mb-0" role="button" data-toggle="collapse" data-target="#collapseAlert">
              <h6 class="alert-heading mb-0"><span class="material-icons">
              add_circle
              </span>Transaction Created</h6>
              <div class="collapse show" id="collapseAlert">
                <p class="mb-0">Transaction id: <a class="d-flex text-info" rel="noopener noreferrer" target="_blank" href="https://ropsten.etherscan.io/tx/${hash}">${hash}&nbsp;<span class="material-icons">open_in_new</span></a></p>
              </div>
            </div>`;
            })
          .on('receipt', (receipt) => {
            createSpinner.style.display = "none";
            document.getElementById('collapseAlert').click()
            createDetails.style.display = "block";
            createDetails.innerHTML = `
            <div class="alert alert-success mb-0" role="button" data-toggle="collapse" data-target="#collapseConfirmed">
              <h6 class="alert-heading mb-0"><span class="material-icons">
              check_circle
              </span>Transaction Confirmed</h6>
              <div class="collapse show" id="collapseConfirmed">
                <p class="mb-0">The transaction was confirmed in block ${receipt.blockNumber} and used ${receipt.gasUsed} gas.</p>
              </div>
            </div>`;
            setTimeout(() => {
            document.getElementById('collapseConfirmed').click()
            createResult.style.display = "block";
            createResult.innerHTML = `
            <div class="card">
              <div class="card-header">
                <h6><span class="material-icons">
                done_outline
                </span>New Post Created (id: ${receipt.events.PostCreated.returnValues.id - 1})</h6>
              </div>
              <div class="card-body">
                <p class="card-text">Post content:</p>
                <h5 class="card-title">${receipt.events.PostCreated.returnValues.content}</h5>
              </div>
            </div>`;
            }, 2000);
            postCount.innerHTML = receipt.events.PostCreated.returnValues.id-1;
          })
          .on('error', (error) => {
            createSpinner.style.display = "none";
            createTransactionHash.style.display = "none";
            createDetails.style.display = "none";
            createResult.innerHTML = `
            <div class="alert alert-danger" role="alert">
            <h6 class="alert-heading"><span class="material-icons">error</span>Transaction Failed</h6>
            <p class="mb-0">There was an error while trying to create a new post.</p>
            </div>`;
          });
      });

      find.addEventListener('submit', e => {
        e.preventDefault();
        findSpinner.style.display = "block";
        const id = e.target.elements[0].value
        postlist.methods.getPost(id)
          .call()
          .then(result => {
            findSpinner.style.display = "none";
            findResult.innerHTML = `
            <div class="card">
              <div class="card-header">
                <h6><span class="material-icons">
                done_outline
                </span>Post Found (id: ${result[0]})</h6>
              </div>
              <div class="card-body">
                <p class="card-text">Post content:</p>
                <h5 class="card-title">${result[1]}</h5>
              </div>
            </div>`;
          })
          .catch(() => {
            findSpinner.style.display = "none";
            findResult.innerHTML = `
            <div class="alert alert-danger" role="alert">
            <h6 class="alert-heading"><span class="material-icons">error</span>Post (id: ${id}) not found.</h6>
            <p class="mb-0">The post may not exist yet or it has been deleted.</p>
            </div>`;
          });
      });

      findAll.addEventListener('submit', e => {
        e.preventDefault();
        findAllBtn.disabled = true;
        findAllBtn.classList.add('no-hover');
        findAllSpinner.style.display = "block";
        let postnumber;
        let posts = [];
        let postitem;
        postlist.methods.postCount()
        .call()
        .then((_postnumber) => {
          return postnumber = _postnumber;
        })
        .then(() => {
          for(let i = 1; i < postnumber; i++) {
            postlist.methods.getPost(i)
            .call()
            .then(post => {
              posts.push(post)
            })
            .catch((error) => {
              if(error) {
                posts.push([i,'The post content has been deleted.'])
              }
            })
            .then(() => {
              posts.forEach((post) => {
                post[1] === 'The post content has been deleted.' ?
                postitem = `
                <div class="alert alert-danger" role="alert">
                <h6 class="alert-heading"><span class="material-icons">error</span>Post (id: ${post[0]}) not found.</h6>
                <p class="mb-0">${post[1]}</p>
                </div>`
                :
                postitem = `
                <div class="card">
                  <div class="card-header">
                    <h6><span class="material-icons">
                    done_outline
                    </span>Post Found (id: ${post[0]})</h6>
                  </div>
                  <div class="card-body">
                    <p class="card-text">Post content:</p>
                    <h5 class="card-title">${post[1]}</h5>
                  </div>
                </div>`;
              });
              let postElement = document.createElement("p");
              findAllResult.appendChild(postElement);
              findAllSpinner.style.display = "none";
              postElement.innerHTML = postitem;  
          })
          .catch((error) => {
            findAllSpinner.style.display = "none";
            console.log(error);
          });
          }
        });
      }, {once : true});

      update.addEventListener('submit', e => {
        e.preventDefault();
        updateSpinner.style.display = "block";
        const id = e.target.elements[0].value;
        const content = e.target.elements[1].value;
        postlist.methods.updatePost(id, content)
          .send({from: accounts[0]})
          .on('transactionHash', (hash) => {
            updateResult.style.display = "none";
            updateDetails.style.display = "none";
            updateTransactionHash.style.display = "block";
            updateTransactionHash.innerHTML = `
            <div class="alert alert-primary mb-0" role="button" data-toggle="collapse" data-target="#collapseAlert">
              <h6 class="alert-heading mb-0"><span class="material-icons">
              add_circle
              </span>Transaction Created</h6>
              <div class="collapse show" id="collapseAlert">
                <p class="mb-0">Transaction id: <a class="d-flex text-info" rel="noopener noreferrer" target="_blank" href="https://ropsten.etherscan.io/tx/${hash}">${hash}&nbsp;<span class="material-icons">open_in_new</span></a></p>
              </div>
            </div>`;
            })
          .on('receipt', (receipt) => {
            updateSpinner.style.display = "none";
            document.getElementById('collapseAlert').click()
            updateDetails.style.display = "block";
            updateDetails.innerHTML = `
            <div class="alert alert-success mb-0" role="button" data-toggle="collapse" data-target="#collapseConfirmed">
              <h6 class="alert-heading mb-0"><span class="material-icons">
              check_circle
              </span>Transaction Confirmed</h6>
              <div class="collapse show" id="collapseConfirmed">
                <p class="mb-0">The transaction was confirmed in block ${receipt.blockNumber} and used ${receipt.gasUsed} gas.</p>
              </div>
            </div>`;
            setTimeout(() => {
            document.getElementById('collapseConfirmed').click()
            updateResult.style.display = "block";
            updateResult.innerHTML = `
            <div class="card">
              <div class="card-header">
                <h6><span class="material-icons">
                done_outline
                </span>Post Updated (id: ${receipt.events.PostUpdated.returnValues.id})</h6>
              </div>
              <div class="card-body">
                <p class="card-text">Updated post content:</p>
                <h5 class="card-title">${receipt.events.PostUpdated.returnValues.content}</h5>
              </div>
            </div>`;
            }, 2000);
          })
          .on('error', (error) => {
            updateSpinner.style.display = "none";
            updateTransactionHash.style.display = "none";
            updateDetails.style.display = "none";
            updateResult.innerHTML = `
            <div class="alert alert-danger" role="alert">
            <h6 class="alert-heading"><span class="material-icons">error</span>Transaction Failed</h6>
            <p class="mb-0">There was an error while trying to update post (id: ${id}). Only the account which created a post is allowed to update it or the post may not exist.</p>
            </div>`;
          });
      });

      remove.addEventListener('submit', e => {
        e.preventDefault();
        removeSpinner.style.display = "block";
        const id = e.target.elements[0].value;
        postlist.methods.deletePost(id)
          .send({from: accounts[0]})
          .on('transactionHash', (hash) => {
            removeResult.style.display = "none";
            removeDetails.style.display = "none";
            removeTransactionHash.style.display = "block";
            removeTransactionHash.innerHTML = `
            <div class="alert alert-primary mb-0" role="button" data-toggle="collapse" data-target="#collapseAlert">
              <h6 class="alert-heading mb-0"><span class="material-icons">
              add_circle
              </span>Transaction Created</h6>
              <div class="collapse show" id="collapseAlert">
                <p class="mb-0">Transaction id: <a class="d-flex text-info" rel="noopener noreferrer" target="_blank" href="https://ropsten.etherscan.io/tx/${hash}">${hash}&nbsp;<span class="material-icons">open_in_new</span></a></p>
              </div>
            </div>`;
            })
          .on('receipt', (receipt) => {
            removeSpinner.style.display = "none";
            document.getElementById('collapseAlert').click()
            removeDetails.style.display = "block";
            removeDetails.innerHTML = `
            <div class="alert alert-success mb-0" role="button" data-toggle="collapse" data-target="#collapseConfirmed">
              <h6 class="alert-heading mb-0"><span class="material-icons">
              check_circle
              </span>Transaction Confirmed</h6>
              <div class="collapse show" id="collapseConfirmed">
                <p class="mb-0">The transaction was confirmed in block ${receipt.blockNumber} and used ${receipt.gasUsed} gas.</p>
              </div>
            </div>`;
            setTimeout(() => {
            document.getElementById('collapseConfirmed').click()
            removeResult.style.display = "block";
            removeResult.innerHTML = `
            <div class="card">
              <div class="card-header">
                <h6><span class="material-icons">
                done_outline
                </span>Post Deleted (id: ${receipt.events.PostDeleted.returnValues.id})</h6>
                <p class="mb-0">The post content has been deleted.</h5>
              </div>
            </div>`;
            }, 2000);
          })
          .on('error', (error) => {
            removeSpinner.style.display = "none";
            removeTransactionHash.style.display = "none";
            removeDetails.style.display = "none";
            removeResult.innerHTML = `
            <div class="alert alert-danger" role="alert">
            <h6 class="alert-heading"><span class="material-icons">error</span>Transaction Failed</h6>
            <p class="mb-0">There was an error while trying to delete post (id: ${id}). Only the account which created the post can delete it or the post may not exist.</p>
            </div>`;
          });
      });
  };

  // Web3, the contract instance, and the frontend application are set once a user clicks to connect a wallet
document.addEventListener('DOMContentLoaded', () => {
  const ethereumButton = document.querySelector('.enableEthereumButton');

  ethereum.selectedAddress === null ?
  ethereumButton.addEventListener('click', () => {
    initWeb3()
      .then(_web3 => {
        web3 = _web3;
        postlist = initContract();
        initApp();
      })
      .catch(err => console.log(err.message));
    }, {once : true})
    :
    initWeb3()
    .then(_web3 => {
      web3 = _web3;
      postlist = initContract();
      initApp();
    })
    .catch(err => console.log(err.message));
  });