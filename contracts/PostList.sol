pragma solidity >=0.5.0 <0.7.0;

contract PostList {
    struct Post {
        uint id;
        string content;
    }
    Post[] public posts;
    address owner = msg.sender;
    uint public postCount = 1;
    event PostCreated(
        uint id,
        string content
    );
    event PostUpdated(
        uint id,
        string content
    );
    event PostDeleted(
        uint id
    );
    function createPost(string memory content) public {
        owner = msg.sender;
        posts.push(Post(postCount, content));
        postCount++;
        emit PostCreated(postCount, content);
    }
    function getPost(uint id) public view returns(uint, string memory) {
        uint i = find(id);
        return(posts[i].id, posts[i].content);
    }
    function updatePost(uint id, string memory content) public {
        require(msg.sender == owner, "Address not authorized.");
        uint i = find(id);
        posts[i].content = content;
        emit PostUpdated(id, content);
    }
    function deletePost(uint id) public {
        require(msg.sender == owner, "Address not authorized.");
        uint i = find(id);
        delete posts[i];
        emit PostDeleted(id);
    }
    function find(uint id) internal view returns(uint) {
        for(uint i = 0; i < posts.length; i++) {
            if(posts[i].id == id) {
                return i;
            }
        }
        revert("Post not found.");
    }
    constructor() public {
        createPost("First default post.");
    }
}