window.onload = () => {
    $('#current-date').text(new Date());

    if($('#shoutbox').length) {
        logShout()
    }
    if ($('#markdown_content').length) {
        window.easyMDE = new EasyMDE({
            element: $('#markdown_content')[0],
            renderingConfig: {
                singleLineBreaks: false
            },
            toolbar: ['strikethrough', 'bold', 'unordered-list', 'ordered-list', 'link', 'image', 'code', 'table'],
        });
    }
    if ($('#reply-btn').length) {
        $('#reply-btn').on('click', postThreadReply);
    }
    if ($('#post-thread-btn').length) {
        $('#post-thread-btn').on('click', postNewThread);
    }
    if ($('#preview-thread-btn').length) {
        $('#preview-thread-btn').on('click', previewNewThread);
    }
    if ($('.p-report').length) {
        $('.p-report').on('click', (el) => {
            reportThreadPost(el.target.dataset.post_id);
        });
    }

}



const logShout = () => {
    const messages = [
        "<small><span>Jotaro</span>: No</small><br>",
        "<small><span>MonkaHack</span>: :kappa:</small><br>",
        "<small><span>p0nytail</span>: sasageyo!</small><br>",
        "<small><span>h3dgeh0g</span>: Watashi no na wa Kira Yoshikage.</small><br>",
        "<small><span>big-ins3cur3-mak</span>: You can't spell narcissism without I.</small><br>",
        "<small><span>rayhan0x69</span>: I am Jack's Raging Bile Duct.</small><br>",
        "<small><span>smol-ins3cur3-mak</span>: Deploying K8s is like alcoholism but less productive</small><br>",
        "<small><span>clubby678</span>: Oh good heavens! How utterly cringeworthy.</small><br>",
        "<small><span>thewildforensics</span>: -1 for intergalactic recovery</small><br>",
        "<small><span>dryh4nds</span>: UwU can be read as quadruple U</small><br>",
        "<small><span>wizardbologn3s</span>: Who needs a gf when maths have curves</small><br>",
        "<small><span>nikos</span>: hardware gets me hard</small><br>",
        "<small><span>RTX</span>: 0 days since successful release</small><br>",
        "<small><span>Heisenberg</span>: Say my Name!</small><br>",
        "<small><span>p1nkguy</span>: eyy b0ss</small><br>",
        "<small><span>Tony</span>: Who wants to start a business?</small><br>",
        "<small><span>cryptoX</span>: invest in GTC</small><br>",
        "<small><span>mr.robot</span>: We blame society, but we are society</small><br>",
        "<small><span>gasgas</span>: <img class=\"smiley\" src=\"/static/images/gifs/drive.gif\" alt=\":drive:\"></small><br>",
        "<small><span>Ineedlob</span>: <img class=\"smiley\" src=\"/static/images/gifs/gib.png\" alt=\"gib.png\"></small><br>",
        "<small><span>trapp3d</span>: <img class=\"smiley\"src=\"/static/images/gifs/monkas.png\" alt=\":monkas:\"></small><br>",
        "<small><span>jailm4n</span>: <img class=\"smiley\" src=\"/static/images/gifs/pepejail.gif\" alt=\":pepejail:\"></small><br>",
        "<small><span>badcop</span>: <img class=\"smiley\" src=\"/static/images/gifs/police.png\" alt=\":police:\"></small><br>",
        "<small><span>sl33pg0at</span>: <img class=\"smiley\" src=\"/static/images/gifs/sleepingpepe.png\" alt=\":sleepingpepe:\"></small><br>",

    ]
    setInterval(()=> {
        $('#shoutbox').prepend(messages[Math.floor(Math.random()*messages.length)]);
    }, 1500);
}

const postThreadReply = async () => {
    $('#reply-btn').prop('disabled', true);

	card = $('#resp-msg');
	card.text('Submitting your reply...');
    card.show();

	id = $('#reply-thread-id').val();

    let comment = window.easyMDE.value();

	if ($.trim(comment) === '') {
		$('#reply-btn').prop('disabled', false);
		card.text('Add some content first!');
		card.show();
		return;
	}

	await fetch('/api/threads/reply', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({id, comment}),
	})
	.then((resp) => {
        respJson = resp.json();

        $('#reply-btn').prop('disabled', false);

		if (resp.status == 200) {
            window.location = window.location.href+'?'+new Date().getTime();
		}
		else {
			if (response.hasOwnProperty('message')) {
				card.text(response.message);
				return;
			}
			card.text('Something went wrong, please try again!');
		}
    })
	.catch((error) => {
		console.log(error);
		card.text('Something went wrong, please try again!');
		$('#reply-btn').prop('disabled', false);
	});
}

const previewNewThread = () => {
    card = $('#resp-msg');

    let content = window.easyMDE.value();

	if ($.trim(content) === '') {
		card.text('Add some content first!');
		card.show();
		return;
	}

    let cat_id = $('#cat_id').val();

    if(!cat_id) {
        card.text('Select a category first!');
		card.show();
		return;
    }

    $('#new-th-content').val(content);
    $('#thread-form').attr('action', `/threads/preview?${new Date().getTime()}`);
    $('#thread-form')[0].submit();
}


const postNewThread = () => {
    card = $('#resp-msg');

    let content = window.easyMDE.value();

	if ($.trim(content) === '') {
		card.text('Add some content first!');
		card.show();
		return;
	}

    let cat_id = $('#cat_id').val();

    if(!cat_id) {
        card.text('Select a category first!');
		card.show();
		return;
    }

    $('#new-th-content').val(content);
    $('#thread-form').attr('action', `/threads/create`);
    $('#thread-form')[0].submit();
}


const reportThreadPost = async (post_id) => {

    showToast('Reporting this post, please wait...', true);
    await fetch('/api/report', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({post_id}),
	})
    .then(async (resp) => {
        response = await resp.json();
        if (response.hasOwnProperty('message')) {
            showToast(response.message);
            return;
        }
        showToast('Thread post reported successfully!');
    })
	.catch((error) => {
		console.log(error);
	});
}

const showToast = (msg, fixed=false) => {
    $('#globalToast').hide();
    $('#globalToast').slideDown();
    $('#globalToastMsg').text(msg);
    if (!fixed) {
        setTimeout(() => {
            $('#globalToast').slideUp();
        }, 2000);
    }
}