import os
import time
import json
import signal
import asyncio
import hashlib
import logging
import tornado.web
import tornado.websocket

basePath = os.path.dirname(os.path.abspath(__file__))
resourcesPath = basePath + '/webroot'
save_period = 5 # In minutes

logging.basicConfig(filename="log.txt", level=logging.DEBUG, format="%(asctime)s %(message)s")

class CustomItem():
    curr_id = 0
    stored = dict()

    def new(creator):
        self = CustomItem()

        self.id = CustomItem.curr_id
        CustomItem.curr_id += 1

        self.name = "New Item"
        self.name_color = "#FFFFFF"
        self.name_bold = False
        self.item_id = ""
        self.durability = ""
        self.unbreakable = False
        self.model_data = ""
        self.custom_nbt = ""
        self.lore = ""
        self.enchants = []
        self.attributes = []
        self.locations = []
        self.creator = creator
        self.area_tier = 0

        CustomItem.stored[self.id] = self
        return self

    def from_data(data):
        if data['id'] >= CustomItem.curr_id:
            CustomItem.curr_id = data['id'] + 1
        
        self = CustomItem()
        self.id = data['id']
        self.name = data['name']
        self.name_color = data['name_color']
        self.name_bold = data['name_bold']
        self.item_id = data['item_id']
        self.durability = data['durability']
        self.unbreakable = data['unbreakable']
        self.model_data = data['model_data']
        self.custom_nbt = data['custom_nbt']
        self.lore = data['lore']
        self.enchants = data['enchants']
        self.attributes = data['attributes']
        self.locations = data['locations']
        self.creator = data['creator']
        self.area_tier = data['area_tier']

        CustomItem.stored[self.id] = self
        return self

    def to_entry_obj(self):
        return {
            'id': self.id,
            'name': self.name,
            'name_color': self.name_color,
            'name_bold': self.name_bold,
            'item_id': self.item_id,
            'creator': self.creator,
            'area_tier': self.area_tier,
        }
    
    def to_full_obj(self):
        return {
            'id': self.id,
            'name': self.name,
            'name_color': self.name_color,
            'name_bold': self.name_bold,
            'item_id': self.item_id,
            'durability': self.durability,
            'unbreakable': self.unbreakable,
            'model_data': self.model_data,
            'custom_nbt': self.custom_nbt,
            'lore': self.lore,
            'enchants': self.enchants,
            'attributes': self.attributes,
            'locations': self.locations,
            'creator': self.creator,
            'area_tier': self.area_tier,
        }

    def remove(id):
        del CustomItem.stored[id]
    
    def update(id, data):
        CustomItem.stored[id] = data

    def save():
        print("Saving item data...")
        with open('item_data.json', 'w') as f:
            f.write("[" + 
                ",".join(map(lambda item: json.dumps(item.to_full_obj()), CustomItem.stored.values()))
             + "]\n")
        print("Saved {} items.".format(len(CustomItem.stored)))

    def load():
        try:
            with open('item_data.json', 'r') as f:
                print("Loading item data...")
                data = json.loads(f.readline())

                CustomItem.curr_id = 0
                CustomItem.stored = dict()
                for item in data:
                    CustomItem.from_data(item)
                print("Loaded {} items.".format(len(CustomItem.stored)))
        except FileNotFoundError:
            print("Couldn't find past items, starting with empty list.")

class UserList():
    stored = dict()

    def add(ip, username):
        print("Assigning user {} to IP {}".format(username, ip))
        UserList.stored[ip] = username
        UserList.save()

    def get(ip):
        return UserList.stored[ip] if ip in UserList.stored else None
    
    def save():
        with open('user_logins.json', 'w') as f:
            print("Saving user logins...")
            f.write(json.dumps(UserList.stored) + "\n")
            print("Saved {} user logins.".format(len(UserList.stored)))

    def load():
        try:
            with open('user_logins.json', 'r') as f:
                print("Loading user logins...")
                UserList.stored = json.loads(f.readline())
                print("Loaded {} user logins.".format(len(UserList.stored)))
        except FileNotFoundError:
            print("Couldn't find past logins, starting with empty list.")

class SafeRedirectHandler(tornado.web.RequestHandler):
    def get(self):
        self.redirect("https://" + self.request.host)

class IndexHandler(tornado.web.RequestHandler):
    def get(self):
        if UserList.get(self.request.remote_ip) != None:
            self.render(resourcesPath + "/index.html")
            return
        self.render(resourcesPath + "/login.html")

    def post(self):
        username = self.request.body_arguments['username'][0].decode('UTF-8')
        password = hashlib.sha256(self.request.body_arguments['password'][0]).hexdigest()

        if verify_pass(username, password):
            UserList.add(self.request.remote_ip, username)

        self.redirect("/")

class SocketHandler(tornado.websocket.WebSocketHandler):
    curr_id = 0
    current = dict()

    def open(self):
        temp_user = UserList.get(self.request.remote_ip)
        if temp_user == None: return

        self.id = SocketHandler.curr_id
        SocketHandler.curr_id += 1
        SocketHandler.current[self.id] = self

        self.user = temp_user
        self.write_message(username_msg(self.user))

        for item in CustomItem.stored.values():
            self.write_message(add_item_msg(item, ""))

    def on_message(self, message):
        data = json.loads(message)

        if data['type'] == 'new_item':
            create_item(self.user)
            return
        
        if data['type'] == 'load_item':
            item = CustomItem.stored[int(data['id'])]
            self.write_message(load_item_msg(item))
            return

        if data['type'] == 'update_item':
            update_item(data['item'], self.user)
            return

        if data['type'] == 'delete_item':
            delete_item(int(data['id']), self.user)
            return

    def on_close(self):
        del SocketHandler.current[self.id]

    def broadcast(msg):
        for socket in SocketHandler.current.values():
            socket.write_message(msg)

def create_item(creator):
    new_item = CustomItem.new(creator)
    msg = add_item_msg(new_item, creator)
    SocketHandler.broadcast(msg)
    logging.debug(msg)

def add_item_msg(item: CustomItem, user):
    response = {
        'type': 'add_item',
        'item': item.to_entry_obj(),
        'user': user,
    }
    return json.dumps(response)

def delete_item(id, deleter):
    CustomItem.remove(id)
    msg = remove_item_msg(id, deleter)
    SocketHandler.broadcast(msg)
    logging.debug(msg)

def remove_item_msg(id, user):
    response = {
        'type': 'remove_item',
        'id': id,
        'user': user,
    }
    return json.dumps(response)

def load_item_msg(item: CustomItem):
    response = {
        'type': 'load_item',
        'item': item.to_full_obj(),
    }
    return json.dumps(response)

def update_item(item_data, user):
    id = int(item_data['id'])

    CustomItem.stored[id].name = item_data['name']
    CustomItem.stored[id].name_color = item_data['name_color']
    CustomItem.stored[id].name_bold = item_data['name_bold']
    CustomItem.stored[id].item_id = item_data['item_id']
    CustomItem.stored[id].durability = item_data['durability']
    CustomItem.stored[id].unbreakable = item_data['unbreakable']
    CustomItem.stored[id].model_data = item_data['model_data']
    CustomItem.stored[id].custom_nbt = item_data['custom_nbt']
    CustomItem.stored[id].lore = item_data['lore']
    CustomItem.stored[id].enchants = item_data['enchants']
    CustomItem.stored[id].attributes = item_data['attributes']
    CustomItem.stored[id].locations = item_data['locations']
    CustomItem.stored[id].area_tier = item_data['area_tier']

    msg = update_item_msg(CustomItem.stored[id], user)
    SocketHandler.broadcast(msg)
    logging.debug(msg)

def update_item_msg(item: CustomItem, user):
    response = {
        'type': 'update_item',
        'item': item.to_entry_obj(),
        'user': user,
    }
    return json.dumps(response)

def username_msg(user):
    response = {
        'type': 'username',
        'user': user,
    }
    return json.dumps(response)

def verify_pass(user, hash):
    try:
        with open('hashed_passwords', 'r') as f:
            for line in f:
                stored_user, stored_hash = line.strip().split()
                if stored_user[0] == '#':
                    continue
                if user == stored_user:
                    return hash == stored_hash
    except FileNotFoundError:
        open('hashed_passwords', 'w')
    except:
        pass

    return False

def make_app():
    return tornado.web.Application(
        handlers=[
            (r'/', IndexHandler),
            (r'/socket', SocketHandler),
            (r'/(.*)', tornado.web.StaticFileHandler, {'path': resourcesPath})
        ],
        settings={'static_path': resourcesPath, 'template_path': 'templates'}
    )

def make_http_redirect():
    return tornado.web.Application(
        handlers=[
            (r'/', SafeRedirectHandler),
        ]
    )

def int_handler(signum, frame):
    print("Exiting...")
    server.stop()
    redirect_server.stop()
    time.sleep(5)

    CustomItem.save()
    tornado.ioloop.IOLoop.instance().stop()
    time.sleep(1)
    exit(0)

async def main():
    signal.signal(signal.SIGINT, int_handler)
    CustomItem.load()
    UserList.load()

    app = make_app()
    redirect = make_http_redirect()
    global server
    server = tornado.httpserver.HTTPServer(app, ssl_options={
        "certfile": "server.crt",
        "keyfile": "server.key",
    })
    server.listen(443)
    global redirect_server
    redirect_server = redirect.listen(80)

    tornado.ioloop.PeriodicCallback(CustomItem.save, 60 * 1000 * save_period).start()
    await asyncio.Event().wait()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except RuntimeError as e:
        if 'Event loop stopped' in e.args[0]: pass
        else: raise(e)
