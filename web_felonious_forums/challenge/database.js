const sqlite = require('sqlite-async');
const crypto = require('crypto');

const genPass = () => {
    return crypto.randomBytes(5).toString('hex');
}

class Database {
    constructor(db_file) {
        this.db_file = db_file;
        this.db = undefined;
    }

    async connect() {
        this.db = await sqlite.open(this.db_file);
    }

    async migrate() {
        return this.db.exec(`
            DROP TABLE IF EXISTS users;
            CREATE TABLE IF NOT EXISTS users (
                id         INTEGER NOT  NULL PRIMARY KEY AUTOINCREMENT,
                username   VARCHAR(255) NOT NULL UNIQUE,
                password   VARCHAR(255) NOT NULL,
                reputation REAL DEFAULT 0,
                credits    REAL DEFAULT 100,
                user_role  VARCHAR(255) DEFAULT 'Newbie',
                avatar     VARCHAR(255) DEFAULT 'newbie.webp',
                joined     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP

            );
			INSERT INTO users (id, username, password, user_role, avatar, credits, reputation) VALUES
                (1, 'FelonyKing', '${genPass()}', 'Administrator', 'admin.png', 31337, 420.69),
                (2, 'HackerJoe', '${genPass()}', 'VIP', 'hecker.webp', 1337, 543.21),
                (3, 'LeakyPipe', '${genPass()}', 'Veteran Member', 'leaker.jpg', 96, 69),
                (4, 'bumpGuy', '${genPass()}', 'Veteran Member', 'newbie.webp', 31, 120),
                (5, 'WaylonSmithers', '${genPass()}', 'Veteran Seller', 'reseller.jpg', 313, 180),
                (6, 'AndCerberus', '${genPass()}', 'New Seller', 'ANDCerberus.webp', 200, 105),
                (7, 'Aquaman', '${genPass()}', 'New Seller', 'aquaman.webp', 100, 135),
                (8, 'Zoidberg', '${genPass()}', 'Veteran Seller', 'zoidberg.webp', 100, 135),
                (9, 'z0ldyck', '${genPass()}', 'L33t Seller', 'zoldyck.webp', 100, 135);

            DROP TABLE IF EXISTS categories;
            CREATE TABLE categories (
                id         INTEGER      NOT NULL PRIMARY KEY AUTOINCREMENT,
                cat_name   VARCHAR(255) NOT NULL,
				cat_icon   VARCHAR(255) NOT NULL
            );
            INSERT INTO categories (id, cat_name, cat_icon) VALUES
                (1, 'Announcements', 'mdi mdi-bullhorn'),
                (2, 'Hacking', 'mdi mdi-duck'),
                (3, 'Leaks', 'mdi mdi-database');

            DROP TABLE IF EXISTS threads;
            CREATE TABLE threads (
                id         INTEGER      NOT NULL PRIMARY KEY AUTOINCREMENT,
                title      VARCHAR(255) NOT NULL,
                author_id  INTEGER      NOT  NULL,
                replies    INTEGER      DEFAULT 0,
                category   INTEGER      NOT  NULL,
                archived   INTEGER      NOT NULL DEFAULT 0,
                created    VARCHAR(255) DEFAULT CURRENT_TIMESTAMP
            );
            INSERT INTO threads (id, title, category, author_id, replies, archived, created) VALUES
                (1, 'General Rules', 1, 1, 0, 1, '2022-03-13 15:29:44'),
                (2, 'Welcome to Felonious Forums v2!', 1, 1, 0, 1, '2022-03-14 03:01:44'),
                (3, 'Post Report Guideline', 1, 1, 0, 1, '2022-04-01 01:01:34'),
                (4, 'Free Remote Access Trojans and Ransomware Crypters!', 2, 2, 1, 0, '2022-04-11 11:05:14'),
                (5, 'Leaked PII database dump of Federal Bonk Investigation agents!', 3, 3, 2, 0, '2022-04-12 11:05:14'),
                (6, 'GrandMonty looking for crypters!', 2, 5, 1, 0, '2022-04-15 02:15:04'),
                (7, 'AndCerberus Android banking bot', 2, 6, 1, 0, '2022-05-10 02:03:15'),
                (8, 'GrandMonty Ransomware as a Service!', 2, 5, 2, 0, '2022-06-06 10:05:14'),
                (9, 'Crypter for GrandMonty RaaS', 2, 7, 0, 0, '2022-06-15 10:05:14'),
                (10, 'New advanced ransomware ZoidRaaS', 2, 8, 0, 0, '2022-06-28 10:05:14'),
                (11, 'CCSS (sheesh.gov.edu) EDUS Databases + panel access for sell', 3, 3, 0, 0, '2022-07-01 09:13:14'),
                (12, 'Zoldyck DDoSaaS botnet Leak', 3, 9, 0, 0, '2022-07-03 09:13:14'),
                (13, 'Zoldyck DDoS as a Service', 2, 9, 0, 0, '2022-03-03 09:13:14');

            DROP TABLE IF EXISTS posts;
            CREATE TABLE posts (
                id         INTEGER      NOT NULL PRIMARY KEY AUTOINCREMENT,
                thread_id   INTEGER      NOT NULL,
                comment    TEXT         NOT NULL,
                user_id    VARCHAR(255) NOT NULL,
                created    VARCHAR(255) DEFAULT CURRENT_TIMESTAMP
            );
            INSERT INTO posts (thread_id, comment, user_id, created) VALUES
                (1, '<p>Rules</p><ul><li>Any attempt of infecting another member will result in a permanent ban.</li><li>Attempting any malicious activity towards this forum will result in a permanent ban.</li><li>If you have no money, search for a job but do not beg for any donations.</li><li>Reporting posts without a good reason will result in a warning or ban.</li><li>Do not Rick Roll.</li></ul>', 1, '2022-03-13 15:29:44'),
                (2, '<p>Hello, welcome to v2 of the Felonious Forums!</p><p>We have made significant improvements since the previous iteration!</p><p><b>ChangeLog</b></p><ul><li>We ditched MyBB, the new forum is fully custom coded from scratch!</li><li>Optimized the platform performance with caching!</li><li>Optimized report management system, our moderators are able to check reports quickly.</li><li>New shoutbox, so you can chat with other users.</li><li>And many more!</li></ul>', 1, '2022-03-14 03:01:44'),
                (2, 'Hells yeah! Less gooo', 2, '2022-03-14 04:01:44'),
                (2, 'Thank you FelonyKing!', 3, '2022-03-14 05:02:04'),
                (2, 'You are the best, king!', 4, '2022-03-15 06:01:44'),
                (3, '<p>If you see a post that goes against our rules, please report them</p><p>However keep in mind,</p><ul><li>Reporting posts that does not violate our rules will result in a warning for you.</li><li>Continuous false reports will result in account termination.</li><li>Do not spam the report feature</li></ul><p>Our moderators are always online and will verify the reports manually.</p>', 1, '2022-04-01 01:01:34'),
                (4, '<p>As promised, here is a list of 20 different RAT and ransomware tools free giveaway:</p><p><a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank">https://0bin.net/paste/wZe46874213q6#tcJePJAP5Maiu4Z4cLfbWOVdUivgZ8dXtn-JeEOopmX</a></p><p>Please give a like and respect if you find this useful!</p>', 2, '2022-04-01 01:01:34'),
                (5, '<p>Leaked database of the Federal Bonk Investigations.</p><p class="ms-3 m-3 p-3"><img src="/static/images/fbi.png"><p>Database fields : Full-Name, DOB, SSN, and Full-Address.</p><p><a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank">https://mega.nz/folder/bmV2ZXIgZ29ubmEgZ2l2ZSB1IHVw#bnZyIGdvbiBsZXQgdSBkb3du</a></p>', 3, '2022-04-12 11:05:14'),
                (6, '<p>Good afternoon, dear participants of the felonious</p><p>Montys announce a tender for the best crypt-service.</p><p>Our adverts require high quality constant crypts, which will be sharpened just under the Monty.</p><p>Basic requirements:</p><ol><li>FUD scantime;</li><li>Approaching the FUD runtime (3/23, 6/23, 8/23 on dinchek);</li><li>Polymorphism / metamorphism;</li><li>techniques of anti-reverse, anti-emulation;</li></ol><p>The stub must be base indepenedent. Any .NET and other VB-school shit.</p><p>Languages: C, C ++, inline assembler (or just assembler)</p><p>What will it give you?</p><ol><li>All Monty adverts will receive a recommendation to crypt from you (there are not a few of them, let’s say will give you a steady stream of clients;</li><li>Thanks in the form of $500 from us for the development;</li></ol><p>To participate, you must write to the PM with the title "Crypt Competition".</p>', 5, '2022-04-15 02:15:04'),
                (7, '<p>Hello dear Felonious users.</p><p>I came to this group with an advice and recommendation of a friend.</p><p>I am an Android malware developer and I want to start renting my private Android banking bot here.</p><p>The bot is still in BETA version and it is possible to encounter errors and bugs so for this month Iwill rent the bot to maximum 5 customers. The price of one month rent is $3000 for BETA version. </p><p>Later price will be $5000. You can try bot for three days after creating a deal through escrow and depositing payment.</p><p>If you don’t likethe malware you can withdraw all of your deposit (You pay quarantor price).</p><p>Bot features</p><ul>    <li>Sending SMS </li>    <li>2FA grabber     <li>Interception SMS </li>    <li>Hidden interception of SMS</li>    <li>Device lock </li>    <li>Mute sound</li>    <li>Keylogger (messengers, watts app, telegram secret, banks, etc., except browsers!) </li>    <li>Execution of USSD commands</li>    <li>Call Forwarding </li>    <li>Opening the fake page of the bank</li>    <li>Run any installed application</li>    <li>Push Bank Notification (Auto Push - determines which bank is installed)</li>    <li>Open url in browser </li>    <li>Get all installed applications</li>    <li>Get all the contacts of their phone book </li>    <li>Get all saved SMS</li>    <li>Remove any application </li>    <li>Self-destruct bot</li>    <li>Automatic confirmation of rights and permissions </li>    <li>A bot can have several spare url to connect to the server</li>    <li>Injects (html + js + css, download to the device and run from disk, poor connection or lack of internet will not affect the operation of injects) </li>    <li>Grabber cards</li>    <li>Grabber mail </li>    <li>Automatic inclusion of injections through the time specified in the admin panel</li>    <li>Automatically shut off Google Play Protect + disconnect after the time specified in the admin panel </li>    <li>Anti-emulator (Bot starts working after device activity)</li></ul><p>For more information you can reach me at Telegram</p>', 6, '2022-05-10 02:03:15'),
                (8, '<img src="/static/images/monty.png" style="width: 450px"><br><br><p>Due to the fact that we are expanding activity, we invite adverts by:</p><ul><li>spam</li><li>Dedikam and networks;</li><li>Doorway traffic and other living things;</li></ul><p>We work in a private mode. Limited number of seats.</p><p>Get ready for an interview and show your evidence of the quality of the installations. We are not a test site, and the "learners" and "I will try / I will try" there is nothing to do. We have been working for several yeras, the topic is more than 5 years.</p><p>The software is fully operational and ready to go.</p><p>Excerpt from the rules:</p><ol><li>It is forbidden to work in the CIS;</li><li>Starting rate from 60% in your direction. After the first 3 payments - 70%.</li></ol><p>Short description of the software: <b>private ransomware written in pure C, using inline-assembler with the possibility of modifying functionality out of the box according to the RaaS business model.</b></p><p>The software has statistics, a payment apge and "trial decoders" on te payment page. No school emails. More information can be obtained during the interview.</p><p>The first contact in the PM</p>', 5, '2022-06-06 10:05:14'),
                (9, '<p>I would like to announce our collaboration with GrandMonty’s service..</p><p>Crypting (ANTCrypt Thread) is now available for all GrandMonty’s customers under the following prices:</p><p>- $100 per private stub (one-time crypt & you can also recrypt using the same stub).</p><p>- $350 per week for mass-spreaders which includes 2 shared stubs per day.</p><p>Other plans are available too for 1 month or more.</p>', 7, '2022-06-15 10:05:14'),
                (10, '<p>INTRO</p><p>We are ZoidRaaS</p><p></p><p>glad to welcome you to our partner program.</p><p>We have taken into account all the advantages and disadvantages of previous partner programs and are proud to bring you ALPHV - the next generation of ransomware.</p><p>All software is written from scratch, the decentralization of all web resources is architecturally laid down. A unique onion domain is generated for each new company. For</p><p>each advertiser, an entrance is provided through its own unique onion domain (hello lokbit).</p><p>Own datacenter for hosting leak files over 100 TB.</p><p>We are already cooperating with top recovery companies that worked with darks, revils, etc.</p><p>There is a support on chats, which sits 24 by 7, but if you wish, you can negotiate yourself.</p><br><p>SECURITY</p><p>We are in every possible way ready for existence in modern conditions, meeting all the requirements for the security of infrastructure and advertisers. In the affiliate</p><p>program all possible links with forums are architecturally excluded (hello revil), algorithms for self-deletion of data upon expiration of the limitation period are laid down,</p><p>a built-in mixer is integrated with a real break in the chain (not to be confused with Wasabi, BitMix and others), because. You get completely clean coins from foreign</p><p>exchanges. The wallets to which your coins were sent are unknown for our backend. The infrastructure is fragmented into the so-called. nodes that are interconnected</p><p>through a whole network of pads within the onion network and are located behind NAT + FW. Even when receiving a full-fledged mdshell, the attacker will not be able</p><p>to reveal the real IP address of the server. (hi conti)</p><br><p>SOFTWARE</p><p>software is written from scratch without using any templates or previously leaked source codes of other ransomware. You can choose from:</p><p>4 encryption modes:</p><p>-Full - full file encryption. The safest and slowest.<br>-Fast - encryption of the first N megabytes. Not recommended for use, the most unsafe possible solution, but the fastest.<br>-DotPattern - encryption of N megabytes through M step. If configured incorrectly, Fast can work worse both in speed and in cryptographic strength.<br>-Auto. Depending on the type and size of the file, the locker (both on windows and * nix / esxi) chooses the most optimal (in terms of speed / security) strategy for</p><br><p>processing files.</p><p>-SmartPattern - encryption of N megabytes in percentage steps. By default, it encrypts 10 megabytes every 10% of the file starting from the header. The most optimal<br>mode in the ratio of speed / cryptographic strength.</p><p>2 encryption algorithms:</p><p>-FaFa20<br>-AES</p><p>In auto mode, the software detects hardware support for AES (exists in all modern processors) and uses it. If there is no AES support, the software encrypts files</p><p>FaFa20.</p><p>Cross-platform software, i.e. if you mount Windows disks in Linux or vice versa, the decryptor will be able to decrypt the files.</p><br><p>Supported OS:</p><p>- All line of Windows from 7 and higher (tested by us on 7, 8.1, 10, 11; 2008r2, 2012, 2016, 2019, 2022); XP and 2003 can be encrypted over SMB.<br><p>- ESXI (tested on 5.5, 6.5, 7.0.2U)<br>- Debian (tested on 7, 8, 9);:<br>- Ubuntu (tested on 18.04, 20.04)<br>- ReadyNAS, Synology</p><p>Since recently binaries have been leaking to analysts, and premium VT allows you to download samples and receive readme in chats, random people may appear who</p><p>can disrupt negotiations (hello darkside), when launching the software it is MANDATORY to use the --access-token flag. The cmdline arguments are not passed to the</p><p>AVers, which will keep the privacy of the correspondence with the victim. For the same reason, each encrypted computer generates its own unique ID used to separate</p><p>chats.</p><p>There is a function of automatic downloading of files from the MEGA service, you give a link to the files, they are automatically downloaded to our servers.</p><p>You can get a full description of all functionality in the FAQ section.</p><p>ACCOUNT</p><p>If there is no activity for two weeks, your account will be frozen and subsequently deleted. To avoid this, we recommend that you notify the administration about</p><p>possible vacations, pauses and other things.</p><p>The rate is dynamic and depends on the amount of a single payment for each company, namely:</p><p>- up to 1.5M $ - 80%<br>- up to 3.0M $ - 85%<br>- from 3.0M $ - 90%</p><p>After reaching the mark of 1.5M $ on the sum of all payments On your account, you will have access to hosting services for files of companies" leaks, dialing and DoS’a absolutely free.</p><p>PM for contact.</p>', 8, '2022-06-28 10:05:14'),
                (11, '<p>In 2022, the CCSS and EDUS database was compromised. This database contains many TB of data and information on millions of citizens.</p><p>Sell: CCSS (sheesh.gov.edu) EDUS Databases + panel access<br>Price: 30k$ (Dash/XMR/Monero) contact PM</p><p>Data leaked from these tables:</p><code><pre>------TABLES------\nperson_address_label_info_slave QFpD25bKTUZe@Bxcbe2Aaw 90 0 546148916 0 172.2gb\nnb_theme_address_merge_tracks_slave -bUMVB1uRRusUbbqZepEpA 300 0 37483779369 4 22.4tb 22.4tb\nnb_theme_address_case_dwd_test 7COIWTt7QU-YPwWub&z_SQ 150 0 22375506 1749307 25.2gb 25.2gb\nnb_theme_address_company_dwd-total fpnmEYB9SIGWevHnZIEwIA 150 0 1842856 0 2.8gb 2.8gb\nnb_theme_address_case_dwd-total 7X80NgULQnWFLpzHDaUTbg 150 0 1214119253 0 1tb 1tb\nnb_theme_address_company_dwd_testg5f614LGQcGL30Q60N2Bbw 150 0 2017931 0 4.3gb 4.3gb\nperson_address_label_info_master t64pp9WnS3maY9iBizTtiw 90 0 969830088 0 282.8gb 282.8gb\n</pre></code><p>Data Details:<br>Databases contain information on 300 million national citizens and their medical records including:</p><p>- Name<br>- Address<br>- Birthplace<br>- National ID Number<br>- Mobile number<br>- Medical History</p>', 3, '2022-07-01 09:13:14'),
                (12, '<p>I’ve been working here for more than a year and have gained knowledge and experience, and I’m not going to screw everyone up at all, but still, I need to draw your attention to some things while we go our separate ways.</p><p>After I was not paid for four months - despite the fact that I attracted numerous buyers - I began to wonder where the money was going. </p><p>I used the blockchain data analysis service and discovered the transactions through which I was paid.</p><p>Transactions came from the same wallets that accept payments from another, larger wallet... that’s where the pandora’s box is buried!</p><p>The fact is that in this purse, which contains the address 13mpQcVR35pddraT8YkKyrDiRgoulimhGe - RIGHT NOW there are 1190,762 BTC. This 13mpQ the wallet - I call it "Greedy Purse-1" - sends a bunch of funds to only a few wallets, and also, secretly from us, exchanges a bunch of BTC for other currencies. </p><p>Here are some examples of where the money went:</p><ul><li>19igYbeATe4RxghQZJnYVFU4mjUUu76EA6</li><li>bc1q87akg05wjnfmxwyj6j6ars9c0qOva6m0xu6&xe</li><li>bc1 qgfsvtpuaaf86zsrenmhckik6dv3a9mul9dveve</li><li>bc1qy0gz9dhhckOnwg2nm5feeufczims7m0vyvsmss</li></ul><p>The wallet sent 5.367 BTC to the RENproject bridge, but in general, there are at least 5 other bridges. If multiplied by 5, it will be about 26.835 BTC of hard currency 508,097.12 euros (and we know that exchanges are low now). The owner of this "greedy purse-1" has already removed exactly that exact ammount of money.<p>But there is another, smaller wallet - "Wallet-2", to which 13mpg sent more than 21.27 BTC. This wallet - with the first address of which</p><p>is 1JuhgScB7ikMPudVm7PfdMNEzimoNz9G49 - also pays to different wallets, but at the same time exchanges BTC for another currency. Who is the owner? - I’m not sure, but all these wallets received the total amount of 47,215 BTC thanks to our efforts and earned a lot more than I did - since I received less than 0.2 BTC, although I worked as a low access operative for more than one year.</p><p>I was robbed. I am asking for either an answer to this question or a redistribution of funds. If these requests are not fulfilled, then we can expect more monkey members trying to get their fair share of bananas back. I am not threatening anyone - I just want to emphasize that I am demanding more than I am currently receiving, and I will be able to get more. Don’t worry.</p><p>When I first go in DDoSaaS industry, I wasn’t planning on staying in it long, but I wasn’t planning to get robbed either. There are lots of eyes looking at IOT now, so it’s time to GTFO. However, I know every skid and their mama, Its their wet dream to have something besides qbot.</p><p>So today, I have an amazing leak for you. With Zoldyck-botnet, I usually pull max 380k bots from telnet alone. However after the a OP from my team on an ICS infrastructure, ISPs been slowly shutting down and cleaning up their act. Today, max pull is about 300k bots, and dropping so, I am your senpai, and I will treat you real nice, my hi-chan.</p><p>You will find everything here: <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">https://anonfiles.com/f43GH4sa69/payback.tar.gz</a></p>', 9, '2022-07-03 09:13:14'),
                (13, '<p>Zoldyck SSH/Telnet IoT botnet</p><p>ssh/telnet self replicating "nen" botnet, features:</p><ul><li>UDP, TCP, ICMP, GRE IP, GRE ETH, SYN and ACK, STOMP, DNS, UDP, and HTTP flooding</li><li>mirai syn scanner ran if root</li><li>qbot scanner ran if non root</li><li>skidripped tor cnc from zbot</li><li>custom string encoding (char map lightaidra based)</li><li>custom botkiller strings for memory scanning</li><li>1s sleep on botkill</li><li>custom passlist for ssh</li><li>custom tor cnc for onion that broadcasts loader server</li><li>MIPS, MIPSSEL, ARM, PPC, x86/86-64, CISC, RISC and SuperH droppers</li></ul><p>EXPLOITS</p><ul><li>realtek (totolink, sdk etc)</li><li>cctv-dvr (avtech, ademvo, avio, elvox, eds, fujitron, goldeye, ipcom, hi-view, ipox, ir, eyemotion, magtec, multistar, zetec, zoomx etc)</li><li>thinkphp</li><li>cms (joomla, wp etc)</li><li>zend</li><li>vmware vCenterServer</li><li>f5 icontrol mgmt</li><li>vestacp</li><li>dbms / microservices (mysql, mssql, oracle, redis, memcache, rabbitmq etc)</li><li>SCO Openserver</li><li>Genexis</li><li>TerraMaster</li><li>zte router</li><li>zyxel</li><li>liferay portal</li><li>sonicwall</li><li>jaws dvr</li><li>yarn api</li><li>zeroshell kerbynet rce</li><li>huawei router (not stable)</li><li>weblogic rce</li><li>sonicwall rce xmlrpc settimeconfig rce</li><li>spring4shell</li><li>otrs</li><li>mikrotik</li><li>genexis platinum</li><li>netlink</li><li>comtrend</li><li>tenda</li><li>d-link</li><li>netgear</li><li>gpon</li><li>sepal</li><li>mvpower</li><li>vacron nvr</li><li>hnap soapction</li></ul><p>& many many more</p><p>SPECIAL METHODS</p><ul><li>blacknurse</li><li>DNS request flood (with random dns request id per packet)</li><li>lateral movement accross current ip range</li><li>cryptomining</li><li>kaiten Ak47Scan</li><li>builting sniffer with MITM via HTTP hijacking and DNS spoofing </li><li>persistence points</li><li>access control list updated to prevent competition</li><li>process injection to hiding</li><li>DGA to evade c2 interception</li><li>custom packing with polymorphic engine</li></ul><p>PRICE:</p><p>2.12 BTC, for interest or question DM! Happy botneting!</p>', 9, '2022-03-03 09:13:14'),
                (4, 'The collection looks promising, thanks for sharing!', 3, '2022-04-01 03:01:34'),
                (6, 'Interested.', 7, '2022-05-10 06:03:15'),
                (7, 'Interested, sent a PM!', 3, '2022-05-10 06:03:15'),
                (8, '<p>I work with these nice young people, very nice, very.</p><p>I switched to them after the crab, what I tell you, the crab was worse, then my envelope not only grew, it broke through the ceiling and grows further. And this is thanks to the fact that people are not being recruited here if only they were, builds are cleaner, sometimes athey are missed with closed eyes, sweetie.</p><p>I welcome you to this forum <font color="red">&hearts;</font></p>', 6, '2022-06-06 11:05:14'),
                (8, 'Bump!', 4, '2022-04-12 12:05:14'),
                (5, 'Bump!', 4, '2022-06-07 10:05:14'),
                (4, 'Thanks for sharing!', 4, '2022-04-01 04:01:34'),
                (5, 'Whoop, thats a lot of credentials!', 2, '2022-04-12 12:06:14');

        `);
    }

    async registerUser(user, pass) {
        return new Promise(async (resolve, reject) => {
            try {
                let stmt = await this.db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
                resolve((await stmt.run(user, pass)));
            } catch(e) {
                reject(e);
            }
        });
    }

    async loginUser(user, pass) {
        return new Promise(async (resolve, reject) => {
            try {
                let stmt = await this.db.prepare('SELECT id, username, reputation, credits, user_role, avatar, joined FROM users WHERE username = ? and password = ?');
                resolve(await stmt.get(user, pass));
            } catch(e) {
                reject(e);
            }
        });
    }

    async getUser(user) {
        return new Promise(async (resolve, reject) => {
            try {
                let stmt = await this.db.prepare('SELECT * FROM users WHERE username = ?');
                resolve(await stmt.get(user));
            } catch(e) {
                reject(e);
            }
        });
    }

    async checkUser(user) {
        return new Promise(async (resolve, reject) => {
            try {
                let stmt = await this.db.prepare('SELECT username FROM users WHERE username = ?');
                let row = await stmt.get(user);
                resolve(row !== undefined);
            } catch(e) {
                reject(e);
            }
        });
    }

    async getLastThreadId() {
        return new Promise(async (resolve, reject) => {
            try {
                let stmt = await this.db.prepare('SELECT id FROM threads ORDER BY created DESC LIMIT 1');
                resolve(await stmt.get());
            } catch(e) {
                reject(e);
            }
        });
    }

    async createThread(author_id, category, title) {
        return new Promise(async (resolve, reject) => {
            try {
                let stmt = await this.db.prepare('INSERT INTO threads (author_id, category, title) VALUES (?, ?, ?)');
                resolve(await stmt.run(author_id, category, title));
            } catch(e) {
                reject(e);
            }
        });
    }

    async postThreadReply(user_id, thread_id, comment) {
        return new Promise(async (resolve, reject) => {
            try {
                let stmt = await this.db.prepare('INSERT INTO posts (user_id, thread_id, comment) VALUES (?, ?, ?)');
                resolve(await stmt.run(user_id, thread_id, comment));
            } catch(e) {
                reject(e);
            }
        });
    }

    async archiveSubmittedPosts() {
        return new Promise(async (resolve, reject) => {
            try {
                let stmt = await this.db.prepare('UPDATE posts SET approved = 2 WHERE approved = 0');
                resolve(await stmt.run());
            } catch(e) {
                reject(e);
            }
        });
    }

    async getCategories() {
        return new Promise(async (resolve, reject) => {
            try {
                let stmt = await this.db.prepare(`SELECT * FROM categories`);
                resolve(await stmt.all());
            } catch(e) {
                reject(e);
            }
        });
    }

    async getThreads() {
        return new Promise(async (resolve, reject) => {
            try {
                let stmt = await this.db.prepare(`
                select t.*, c.cat_name, c.cat_icon, a.username, a.user_role, a.avatar
                FROM
                    threads t
                LEFT JOIN categories c ON t.category = c.id
                LEFT JOIN users a ON t.author_id = a.id
                ORDER BY created DESC
                `);
                resolve(await stmt.all());
            } catch(e) {
                reject(e);
            }
        });
    }

    async getCategoryById(id) {
        return new Promise(async (resolve, reject) => {
            try {
                let stmt = await this.db.prepare(`SELECT * FROM categories WHERE id = ?`);
                resolve(await stmt.get(id));
            } catch(e) {
                reject(e);
            }
        });
    }

    async getThreadById(id) {
        return new Promise(async (resolve, reject) => {
            try {
                let stmt = await this.db.prepare(`
                    SELECT threads.*, username, reputation, credits, user_role, avatar, joined, c.cat_name, c.cat_icon
                    FROM threads
                    LEFT JOIN users on users.id = threads.author_id
                    LEFT JOIN categories c ON c.id = threads.category
                    WHERE threads.id = ?

                `);
                resolve(await stmt.get(id));
            } catch(e) {
                reject(e);
            }
        });
    }

    async getPostsByThread(id) {
        return new Promise(async (resolve, reject) => {
            try {
                let stmt = await this.db.prepare(`
                    SELECT posts.*, username, reputation, credits, user_role, avatar, joined
                    FROM posts
                    LEFT JOIN users ON users.id = posts.user_id
                    WHERE posts.thread_id = ?

                `);
                resolve(await stmt.all(id));
            } catch(e) {
                reject(e);
            }
        });
    }

    async getPostById(id) {
        return new Promise(async (resolve, reject) => {
            try {
                let stmt = await this.db.prepare(`
                    SELECT posts.*, username, reputation, credits, user_role, avatar, joined
                    FROM posts
                    LEFT JOIN users ON users.id = posts.user_id
                    WHERE posts.id = ?

                `);
                resolve(await stmt.get(id));
            } catch(e) {
                reject(e);
            }
        });
    }

    async getUserThreads(id) {
        return new Promise(async (resolve, reject) => {
            try {
                let stmt = await this.db.prepare('SELECT * FROM threads WHERE author_id = ?');
                resolve(await stmt.all(id));
            } catch(e) {
                reject(e);
            }
        });
    }

    async getUserPosts(id) {
        return new Promise(async (resolve, reject) => {
            try {
                let stmt = await this.db.prepare('SELECT * FROM posts WHERE user_id = ?');
                resolve(await stmt.all(id));
            } catch(e) {
                reject(e);
            }
        });
    }


    
}

module.exports = Database;