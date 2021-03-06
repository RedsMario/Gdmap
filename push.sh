#! /bin/zsh
  echo check git status...
  git status

  echo "Whether to make this submission ? (yes/no)"
  read choice

  if [ ${choice} = yes ]
  then echo Please Enter the commit message:
   else echo "This submission has been cancelled"
      exit
   fi

  read message
  # echo message is $message

  git add .
  git commit -m "$message"
  echo "starting..."
  echo "Whether push to git ? (yes/no)"
  read push_choice

  if [ ${push_choice} = yes ] 
  then echo 'Please enter the branch to be submitted ?'
   else echo "This submission has been cancelled"
      exit
  fi
  
  read branch

  if [ ${push_choice} = yes ]
  then git pull
  echo trying to push to origin $branch...
  git push origin $branch
  else echo Not pushed.
  fi