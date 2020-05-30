const PostList = artifacts.require('PostList');

contract('PostList', () => {
    let postlist = null;
    before(async () => {
        postlist = await PostList.deployed();
    });

    it('Create a new post', async () => {
        await postlist.createPost('Second post');
        const post = await postlist.getPost(2);
        assert(post[0].toNumber() === 2);
        assert(post[1] === 'Second post');
    });

    it('Update a post', async () => {
        await postlist.updatePost(2, 'Second post updated');
        const post = await postlist.getPost(2);
        assert(post[0].toNumber() === 2);
        assert(post[1] === 'Second post updated');
    });

    it('Does not update a post which does not exist', async () => {
        try {
            await postlist.updatePost(3, 'Third post updated');
        } catch (err) {
            assert(err.message.includes("Post not found."));
            return;
        }
        assert(false);
    });

    it('Delete a post', async () => {
        await postlist.deletePost(2);
        try {
            const post = await postlist.getPost(2);
        } catch (err) {
            assert(err.message.includes('Post not found.'));
            return;
        }
        assert(false);
    });

    it('Does not delete a post which does not exist', async () => {
        try {
            await postlist.deletePost(50);
        } catch (err) {
            assert(err.message.includes('Post not found.'));
            return;
        }
        assert(false);
    });
});