import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from './ui/card';
import { CreateSelect } from './create-select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import toast from 'react-hot-toast';

export default function Sidebar({
	hasCode,
	user,
	setUser,
}: {
	hasCode: boolean;
	user: User;
	setUser: (u: User) => void;
}) {
	const [avatar, setAvatar] = useState<string>('');

	async function updateUser() {
		const re = fetch(
			`/api/update_user?name=${user.name.toLowerCase()}&avatar=${avatar}`,
			{
				method: 'POST',
			},
		);

		toast.promise(re, {
			loading: 'Loading',
			success: '',
			error: '',
		});

		const res = await re;
	}

	return (
		<Tabs
			className="flex w-full flex-col items-center justify-center pl-2"
			defaultValue="user">
			<TabsList className="w-[80%]">
				<TabsTrigger value="user" className="w-full">
					User
				</TabsTrigger>
				<TabsTrigger value="task" className="w-full" disabled={!hasCode}>
					Task
				</TabsTrigger>
			</TabsList>
			<TabsContent value="user" className="w-full">
				<Card
					side={'left'}
					className="flex h-full min-h-[40vh] w-full flex-col">
					<CardHeader>
						<CardTitle>User</CardTitle>
						<CardDescription></CardDescription>
					</CardHeader>
					<CardContent className={`${!hasCode && 'text-muted-foreground'}`}>
						<Label htmlFor="name">Name</Label>
						<Input
							value={
								hasCode
									? user
										? user.name
										: localStorage.getItem('username') || ''
									: ''
							}
							placeholder="Loading user information..."
							id="name"
							className="mb-6 capitalize"
							readOnly
						/>
						<Label htmlFor="avatar">Profile Picture</Label>
						<Input
							id="avatar"
							placeholder="Paste an image link here"
							onChange={(evt) => setAvatar(evt.target.value)}
							disabled={!hasCode || avatar == user.avatar}
						/>
					</CardContent>
					<CardFooter className="mt-auto">
						<Button
							variant={'outline'}
							className="ml-auto"
							disabled={!hasCode}
							onClick={async () => {
								if (hasCode) {
									await updateUser();
								}
							}}>
							Save
						</Button>
					</CardFooter>
				</Card>
			</TabsContent>
			<TabsContent value="task" className="w-full">
				<Card
					side={'left'}
					className="flex h-full min-h-[40vh] w-full flex-col">
					<CardHeader>
						<CardTitle>Tasks</CardTitle>
						<CardDescription></CardDescription>
					</CardHeader>
					<CardContent className="flex h-full items-center justify-center">
						<CreateSelect />
					</CardContent>
				</Card>
			</TabsContent>
		</Tabs>
	);
}
