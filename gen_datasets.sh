IS_IP=$([ `echo "$1" | tr -d "\n" | wc -m | awk '{print $1}'` = "12" ] && echo true || echo false)
METHOD=$([[ "$IS_IP" == "true" ]] && echo entrepreneur || echo company)

echo ${echo -n $1}

echo $IS_IP $METHOD

SOURCE=$(curl "https://api.checko.ru/v2/$METHOD?inn=$1&key=AiBEDldGmvLAzdp3")

if [[ $(echo $?) = 0 ]]; then
    echo $SOURCE | jq ". | {source: .data, is_ip: ${IS_IP}, type: \"c22\", formfile: \"form_C_22_10e.pdf\"}" > tests/datasets/c22_$1.json
    echo $SOURCE | jq ". | {source: .data, is_ip: ${IS_IP}, type: \"f22\", formfile: \"form_F_22_10e.pdf\"}" > tests/datasets/f22_$1.json
else
    echo ${SOURCE}
fi